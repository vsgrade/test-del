
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { chatId, message } = await req.json()
    
    if (!chatId || !message) {
      return new Response('Missing chatId or message', { status: 400, headers: corsHeaders })
    }

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!botToken) {
      return new Response('Bot token not configured', { status: 500, headers: corsHeaders })
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Telegram API error:', error)
      return new Response('Failed to send message', { status: 500, headers: corsHeaders })
    }

    return new Response('Message sent', { headers: corsHeaders })
  } catch (error) {
    console.error('Send message error:', error)
    return new Response('Internal Server Error', { status: 500, headers: corsHeaders })
  }
})
