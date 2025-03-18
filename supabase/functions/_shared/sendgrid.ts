// SendGrid client for email sending
export class SendGridClient {
  private apiKey: string;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(emailData: {
    to: string;
    from: string;
    subject: string;
    text?: string;
    html?: string;
  }) {
    const url = `${this.baseUrl}/mail/send`;
    
    const payload = {
      personalizations: [
        {
          to: [{ email: emailData.to }]
        }
      ],
      from: { email: emailData.from },
      subject: emailData.subject,
      content: [
        {
          type: 'text/plain',
          value: emailData.text || ''
        }
      ]
    };
    
    if (emailData.html) {
      payload.content.push({
        type: 'text/html',
        value: emailData.html
      });
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`SendGrid error: ${JSON.stringify(error)}`);
    }
    
    return response;
  }
} 