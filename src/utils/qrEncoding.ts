import { QRFormData } from '../types/qr';

export function encodeWiFiString(
  ssid: string,
  password?: string,
  encryption: 'WPA' | 'WEP' | 'nopass' = 'WPA',
  hidden = false
): string {
  const escapeWiFi = (val: string) =>
    val.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/:/g, '\\:').replace(/,/g, '\\,');

  const s = escapeWiFi(ssid.trim());
  const p = password ? escapeWiFi(password) : '';
  const t = encryption;
  const h = hidden ? 'true' : 'false';

  return `WIFI:S:${s};T:${t};P:${p};H:${h};;`;
}

export function encodeVCard(data: {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  cell?: string;
  email?: string;
  url?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  note?: string;
}): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  const fn = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
  lines.push(`N:${data.lastName || ''};${data.firstName || ''};;;`);
  lines.push(`FN:${fn || 'Contact'}`);

  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.title) lines.push(`TITLE:${data.title}`);
  if (data.phone) lines.push(`TEL;TYPE=WORK,VOICE:${data.phone}`);
  if (data.cell) lines.push(`TEL;TYPE=CELL,VOICE:${data.cell}`);
  if (data.email) lines.push(`EMAIL;TYPE=PREF,INTERNET:${data.email}`);
  if (data.url) {
    const url = data.url.startsWith('http://') || data.url.startsWith('https://') ? data.url : `https://${data.url}`;
    lines.push(`URL:${url}`);
  }

  const hasAddress = data.street || data.city || data.state || data.zip || data.country;
  if (hasAddress) {
    lines.push(
      `ADR;TYPE=WORK:;;${data.street || ''};${data.city || ''};${data.state || ''};${data.zip || ''};${data.country || ''}`
    );
  }

  if (data.note) lines.push(`NOTE:${data.note}`);
  lines.push('END:VCARD');

  return lines.join('\n');
}

export function encodeCalendar(data: {
  title: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
}): string {
  const formatICSDate = (dtStr: string, isAllDay: boolean) => {
    if (!dtStr) return '';
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return '';
    if (isAllDay) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}${month}${day}`;
    }
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startFormatted = formatICSDate(data.startDate, data.allDay);
  const endFormatted = formatICSDate(data.endDate, data.allDay);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VektorQR//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${data.title || 'Event'}`,
  ];

  if (startFormatted) {
    lines.push(data.allDay ? `DTSTART;VALUE=DATE:${startFormatted}` : `DTSTART:${startFormatted}`);
  }
  if (endFormatted) {
    lines.push(data.allDay ? `DTEND;VALUE=DATE:${endFormatted}` : `DTEND:${endFormatted}`);
  }
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);

  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\n');
}

export function formatQRContent(formData: QRFormData): { raw: string; displayTitle: string } {
  switch (formData.type) {
    case 'url': {
      let raw = formData.data.url.trim();
      if (!raw) return { raw: 'https://example.com', displayTitle: 'Website URL' };
      if (!raw.startsWith('http://') && !raw.startsWith('https://')) {
        raw = 'https://' + raw;
      }
      return { raw, displayTitle: raw };
    }

    case 'text': {
      const raw = formData.data.text || 'Scan to view details';
      const preview = raw.length > 30 ? raw.slice(0, 30) + '...' : raw;
      return { raw, displayTitle: preview || 'Plain Text' };
    }

    case 'wifi': {
      const ssid = formData.data.ssid.trim() || 'My_WiFi_Network';
      const raw = encodeWiFiString(
        ssid,
        formData.data.password,
        formData.data.encryption,
        formData.data.hidden
      );
      return { raw, displayTitle: `Wi-Fi: ${ssid}` };
    }

    case 'vcard': {
      const raw = encodeVCard(formData.data);
      const name = [formData.data.firstName, formData.data.lastName].filter(Boolean).join(' ');
      return { raw, displayTitle: name ? `Contact: ${name}` : 'Contact Card' };
    }

    case 'phone': {
      const phone = formData.data.phone.trim();
      const raw = phone ? `tel:${phone}` : 'tel:+1234567890';
      return { raw, displayTitle: `Call ${phone || '+1 234 567 890'}` };
    }

    case 'email': {
      const email = formData.data.email.trim() || 'hello@example.com';
      const params = new URLSearchParams();
      if (formData.data.subject) params.append('subject', formData.data.subject);
      if (formData.data.body) params.append('body', formData.data.body);
      const query = params.toString() ? `?${params.toString()}` : '';
      const raw = `mailto:${email}${query}`;
      return { raw, displayTitle: `Email to ${email}` };
    }

    case 'sms': {
      const phone = formData.data.phone.trim() || '123456';
      const msg = formData.data.message || '';
      const raw = msg ? `smsto:${phone}:${msg}` : `smsto:${phone}`;
      return { raw, displayTitle: `SMS to ${phone}` };
    }

    case 'whatsapp': {
      let phone = formData.data.phone.replace(/[^0-9]/g, '');
      const msg = formData.data.message ? encodeURIComponent(formData.data.message) : '';
      const raw = msg ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/${phone}`;
      return { raw, displayTitle: `WhatsApp: ${phone || 'Chat'}` };
    }

    case 'instagram': {
      let val = formData.data.usernameOrUrl.trim();
      if (!val) val = 'instagram';
      let raw = val;
      if (!val.startsWith('http')) {
        const clean = val.replace(/^@/, '');
        raw = `https://instagram.com/${clean}`;
      }
      return { raw, displayTitle: `Instagram @${val.replace(/^https?:\/\/([w.]+)?instagram\.com\//, '').replace(/^@/, '')}` };
    }

    case 'facebook': {
      let val = formData.data.usernameOrUrl.trim();
      if (!val) val = 'facebook';
      let raw = val;
      if (!val.startsWith('http')) {
        raw = `https://facebook.com/${val.replace(/^@/, '')}`;
      }
      return { raw, displayTitle: 'Facebook Page' };
    }

    case 'youtube': {
      let val = formData.data.usernameOrUrl.trim();
      if (!val) val = 'https://youtube.com';
      let raw = val;
      if (!val.startsWith('http')) {
        raw = val.startsWith('@') ? `https://youtube.com/${val}` : `https://youtube.com/@${val}`;
      }
      return { raw, displayTitle: 'YouTube Channel' };
    }

    case 'location': {
      const { latitude, longitude, query } = formData.data;
      if (latitude && longitude) {
        const raw = `https://maps.google.com/?q=${latitude},${longitude}`;
        return { raw, displayTitle: `Location: ${latitude}, ${longitude}` };
      }
      if (query) {
        const raw = `https://maps.google.com/?q=${encodeURIComponent(query.trim())}`;
        return { raw, displayTitle: `Map: ${query}` };
      }
      return { raw: 'https://maps.google.com', displayTitle: 'Google Maps' };
    }

    case 'calendar': {
      const raw = encodeCalendar(formData.data);
      return { raw, displayTitle: `Calendar: ${formData.data.title || 'Event'}` };
    }
  }
}
