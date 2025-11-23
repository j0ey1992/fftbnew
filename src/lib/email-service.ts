'use client'

import { Order } from './firebase/order-service'

// Email templates for different order statuses
const EMAIL_TEMPLATES = {
  // Customer email templates
  customer: {
    orderCreated: (order: Order) => ({
      subject: `Order Confirmation - ${order.projectName}`,
      body: `
        <h1>Thank you for your order!</h1>
        <p>Dear ${order.customerName},</p>
        <p>We're excited to confirm that your order for <strong>${order.projectName}</strong> has been received and is being processed.</p>
        
        <h2>Order Details:</h2>
        <ul>
          <li><strong>Order ID:</strong> ${order.id}</li>
          <li><strong>Date:</strong> ${formatDate(order.createdAt)}</li>
          <li><strong>Total Amount:</strong> $${order.totalPrice} CRO</li>
          <li><strong>Status:</strong> ${capitalizeFirstLetter(order.status)}</li>
        </ul>
        
        <h2>Selected Features:</h2>
        <ul>
          ${order.selectedFeatures.map(feature => 
            `<li>${capitalizeFirstLetter(feature.replace(/([A-Z])/g, ' $1'))}</li>`
          ).join('')}
        </ul>
        
        <p>You can check the status of your order anytime by visiting: <a href="${getOrderStatusUrl(order.id!)}">Order Status Page</a></p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@reown.com.</p>
        
        <p>Thank you for choosing our services!</p>
        <p>The Reown Team</p>
      `
    }),
    
    statusUpdate: (order: Order) => ({
      subject: `Order Status Update - ${order.projectName}`,
      body: `
        <h1>Your Order Status Has Been Updated</h1>
        <p>Dear ${order.customerName},</p>
        <p>We're writing to inform you that the status of your order for <strong>${order.projectName}</strong> has been updated.</p>
        
        <h2>Order Details:</h2>
        <ul>
          <li><strong>Order ID:</strong> ${order.id}</li>
          <li><strong>Date:</strong> ${formatDate(order.createdAt)}</li>
          <li><strong>Total Amount:</strong> $${order.totalPrice} CRO</li>
          <li><strong>New Status:</strong> ${capitalizeFirstLetter(order.status)}</li>
        </ul>
        
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
        
        <p>You can check the details of your order anytime by visiting: <a href="${getOrderStatusUrl(order.id!)}">Order Status Page</a></p>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team at support@reown.com.</p>
        
        <p>Thank you for choosing our services!</p>
        <p>The Reown Team</p>
      `
    })
  },
  
  // Admin email templates
  admin: {
    newOrder: (order: Order) => ({
      subject: `New Order Received - ${order.projectName}`,
      body: `
        <h1>New Order Received</h1>
        <p>A new order has been received and requires your attention.</p>
        
        <h2>Order Details:</h2>
        <ul>
          <li><strong>Order ID:</strong> ${order.id}</li>
          <li><strong>Project Name:</strong> ${order.projectName}</li>
          <li><strong>Date:</strong> ${formatDate(order.createdAt)}</li>
          <li><strong>Total Amount:</strong> $${order.totalPrice} CRO</li>
          <li><strong>Status:</strong> ${capitalizeFirstLetter(order.status)}</li>
        </ul>
        
        <h2>Customer Information:</h2>
        <ul>
          <li><strong>Name:</strong> ${order.customerName}</li>
          <li><strong>Email:</strong> ${order.customerEmail}</li>
          <li><strong>Wallet Address:</strong> ${order.walletAddress}</li>
        </ul>
        
        <h2>Selected Features:</h2>
        <ul>
          ${order.selectedFeatures.map(feature => 
            `<li>${capitalizeFirstLetter(feature.replace(/([A-Z])/g, ' $1'))}</li>`
          ).join('')}
        </ul>
        
        <p>Project Description:</p>
        <p>${order.projectDescription}</p>
        
        <p>You can manage this order by visiting the <a href="${getAdminOrdersUrl()}">Admin Dashboard</a>.</p>
      `
    }),
    
    paymentReceived: (order: Order) => ({
      subject: `Payment Received - Order ${order.id}`,
      body: `
        <h1>Payment Received</h1>
        <p>A payment has been received for order #${order.id}.</p>
        
        <h2>Order Details:</h2>
        <ul>
          <li><strong>Order ID:</strong> ${order.id}</li>
          <li><strong>Project Name:</strong> ${order.projectName}</li>
          <li><strong>Customer:</strong> ${order.customerName} (${order.customerEmail})</li>
          <li><strong>Amount Paid:</strong> $${order.totalPrice} CRO</li>
          <li><strong>Transaction Hash:</strong> ${order.txHash}</li>
        </ul>
        
        <p>You can view the transaction on <a href="https://cronoscan.com/tx/${order.txHash}">Cronoscan</a>.</p>
        
        <p>You can manage this order by visiting the <a href="${getAdminOrdersUrl()}">Admin Dashboard</a>.</p>
      `
    })
  }
}

// Helper functions
function formatDate(timestamp: any): string {
  if (!timestamp) return 'N/A'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

function getOrderStatusUrl(orderId: string): string {
  // In production, this should use the actual domain
  return `${window.location.origin}/orders/confirmation/${orderId}`
}

function getAdminOrdersUrl(): string {
  // In production, this should use the actual domain
  return `${window.location.origin}/admin/orders`
}

/**
 * Send an email notification
 * @param to Recipient email address
 * @param subject Email subject
 * @param body Email body (HTML)
 * @returns Promise that resolves when the email is sent
 */
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  try {
    // In a real implementation, this would call an API endpoint that sends emails
    // For now, we'll just log the email details to the console
    console.log('Sending email:', { to, subject, body })
    
    // In a production environment, you would implement an actual email sending service
    // This could be using Firebase Functions, a third-party service like SendGrid, etc.
    // Example implementation with Firebase Functions:
    /*
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, subject, body }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to send email')
    }
    
    return true
    */
    
    // For now, we'll simulate a successful email send
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

/**
 * Send order confirmation email to customer
 * @param order Order details
 * @returns Promise that resolves when the email is sent
 */
export async function sendOrderConfirmationEmail(order: Order): Promise<boolean> {
  if (!order.customerEmail) {
    console.error('Cannot send confirmation email: No customer email provided')
    return false
  }
  
  const template = EMAIL_TEMPLATES.customer.orderCreated(order)
  return sendEmail(order.customerEmail, template.subject, template.body)
}

/**
 * Send order status update email to customer
 * @param order Order details
 * @returns Promise that resolves when the email is sent
 */
export async function sendOrderStatusUpdateEmail(order: Order): Promise<boolean> {
  if (!order.customerEmail) {
    console.error('Cannot send status update email: No customer email provided')
    return false
  }
  
  const template = EMAIL_TEMPLATES.customer.statusUpdate(order)
  return sendEmail(order.customerEmail, template.subject, template.body)
}

/**
 * Send new order notification email to admin
 * @param order Order details
 * @param adminEmail Admin email address
 * @returns Promise that resolves when the email is sent
 */
export async function sendNewOrderAdminEmail(order: Order, adminEmail: string): Promise<boolean> {
  const template = EMAIL_TEMPLATES.admin.newOrder(order)
  return sendEmail(adminEmail, template.subject, template.body)
}

/**
 * Send payment received notification email to admin
 * @param order Order details
 * @param adminEmail Admin email address
 * @returns Promise that resolves when the email is sent
 */
export async function sendPaymentReceivedAdminEmail(order: Order, adminEmail: string): Promise<boolean> {
  const template = EMAIL_TEMPLATES.admin.paymentReceived(order)
  return sendEmail(adminEmail, template.subject, template.body)
}

// Default admin email - in a real app, this would be stored in environment variables
export const DEFAULT_ADMIN_EMAIL = 'admin@reown.com'

export default {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
  sendNewOrderAdminEmail,
  sendPaymentReceivedAdminEmail,
  DEFAULT_ADMIN_EMAIL
}