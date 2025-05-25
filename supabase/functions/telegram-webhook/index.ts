
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { message } = await req.json()
    
    if (!message || !message.text) {
      return new Response('No message text', { status: 400, headers: corsHeaders })
    }

    const chatId = message.chat.id
    const userId = message.from.id
    const userName = message.from.username || message.from.first_name || 'Unknown'
    const messageText = message.text

    // Проверяем, есть ли уже открытый тикет для этого пользователя
    const { data: existingTickets, error: ticketError } = await supabaseClient
      .from('tickets')
      .select('*')
      .eq('client_id', userId.toString())
      .eq('status', 'open')
      .limit(1)

    if (ticketError) {
      console.error('Error checking existing tickets:', ticketError)
    }

    let ticketId: string

    if (existingTickets && existingTickets.length > 0) {
      // Добавляем комментарий к существующему тикету
      ticketId = existingTickets[0].id
      
      const { error: commentError } = await supabaseClient
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          author_id: userId.toString(),
          author_type: 'client',
          content: messageText,
          is_internal: false
        })

      if (commentError) {
        console.error('Error adding comment:', commentError)
        return new Response('Error adding comment', { status: 500, headers: corsHeaders })
      }
    } else {
      // Создаем новый тикет
      const { data: newTicket, error: createError } = await supabaseClient
        .from('tickets')
        .insert({
          subject: `Сообщение от ${userName} в Telegram`,
          description: messageText,
          status: 'new',
          priority: 'medium',
          channel: 'telegram',
          client_id: userId.toString(),
          tags: ['telegram']
        })
        .select()
        .single()

      if (createError || !newTicket) {
        console.error('Error creating ticket:', createError)
        return new Response('Error creating ticket', { status: 500, headers: corsHeaders })
      }

      ticketId = newTicket.id

      // Добавляем первый комментарий
      const { error: commentError } = await supabaseClient
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          author_id: userId.toString(),
          author_type: 'client',
          content: messageText,
          is_internal: false
        })

      if (commentError) {
        console.error('Error adding initial comment:', commentError)
      }
    }

    // Сохраняем информацию о чате для будущих ответов
    const { error: chatError } = await supabaseClient
      .from('telegram_chats')
      .upsert({
        chat_id: chatId.toString(),
        user_id: userId.toString(),
        username: userName,
        ticket_id: ticketId
      })

    if (chatError) {
      console.error('Error saving chat info:', chatError)
    }

    // Отправляем подтверждение пользователю
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `Ваше сообщение получено! Номер тикета: #${ticketId.slice(0, 8)}. Мы ответим вам в ближайшее время.`
        })
      })
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
