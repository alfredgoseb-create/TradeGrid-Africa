import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderId, productName, quantity, customerName, customerEmail, deliveryAddress } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'NamLogix Africa <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Order Confirmation #${orderId}`,
      html: `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
        <p>We will process your order and contact you soon.</p>
      `,
    });
    // Also send a copy to admin
    await resend.emails.send({
      from: 'NamLogix Africa <onboarding@resend.dev>',
      to: ['admin@namlogix.com'], // change to your email
      subject: `New Order #${orderId}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      `,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderId, productName, quantity, customerName, customerEmail, deliveryAddress } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'NamLogix Africa <onboarding@resend.dev>',
      to: [customerEmail],
      subject: `Order Confirmation #${orderId}`,
      html: `
        <h2>Thank you for your order, ${customerName}!</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
        <p>We will process your order and contact you soon.</p>
      `,
    });
    // Also send a copy to admin
    await resend.emails.send({
      from: 'NamLogix Africa <onboarding@resend.dev>',
      to: ['admin@namlogix.com'], // change to your email
      subject: `New Order #${orderId}`,
      html: `
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Customer:</strong> ${customerName} (${customerEmail})</p>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Quantity:</strong> ${quantity}</p>
        <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
      `,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}