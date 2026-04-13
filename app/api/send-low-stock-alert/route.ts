import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { productName, stockLevel, supplier } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'NamLogix Africa <onboarding@resend.dev>',
      to: ['admin@namlogix.com'], // CHANGE to your email
      subject: `⚠️ Low stock alert: ${productName}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Current stock:</strong> ${stockLevel}</p>
        <p><strong>Supplier:</strong> ${supplier || 'Not specified'}</p>
        <p>Please reorder soon.</p>
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