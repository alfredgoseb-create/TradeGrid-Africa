// app/api/send-inquiry-email/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, productName, message } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'NamLogix Africa <onboarding@resend.dev>', // Replace with your domain later
      to: ['admin@namlogix.com'], // CHANGE THIS to your real email
      subject: `New inquiry about ${productName}`,
      html: `
        <h2>New Customer Inquiry</h2>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}