export function formatDeliveryMemoryText(input: {
  recipientName: string;
  recipientPhone: string;
  address: string;
  city: string;
  senderName: string;
  label?: string;
}): string {
  const label = input.label?.trim() || 'Saved checkout';
  return [
    `Delivery profile — ${label}:`,
    `recipient ${input.recipientName.trim()}`,
    `phone ${input.recipientPhone.trim()}`,
    `address ${input.address.trim()}`,
    `city ${input.city.trim()}`,
    `sender ${input.senderName.trim()}`,
  ].join(', ');
}
