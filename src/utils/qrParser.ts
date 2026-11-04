import { QRType } from '../types/qr';

export interface ParsedQR {
  type: QRType;
  title: string;
  displayValue: string;
  actionUrl?: string;
  actionLabel?: string;
  details: Record<string, string>;
}

export function parseScannedQR(raw: string): ParsedQR {
  const trimmed = raw.trim();

  // 1. Wi-Fi: WIFI:S:MySSID;T:WPA;P:MyPassword;H:false;;
  if (trimmed.startsWith('WIFI:') || trimmed.startsWith('wifi:')) {
    const details: Record<string, string> = {};
    const unescape = (s: string) => s.replace(/\\([;,:\\])/g, '$1');

    const ssidMatch = trimmed.match(/S:((?:[^;\\]|\\.)*)/i);
    const passMatch = trimmed.match(/P:((?:[^;\\]|\\.)*)/i);
    const typeMatch = trimmed.match(/T:((?:[^;\\]|\\.)*)/i);
    const hiddenMatch = trimmed.match(/H:((?:[^;\\]|\\.)*)/i);

    const ssid = ssidMatch ? unescape(ssidMatch[1]) : 'Unknown Network';
    const password = passMatch ? unescape(passMatch[1]) : '';
    const encryption = typeMatch ? typeMatch[1] : 'WPA';
    const hidden = hiddenMatch ? hiddenMatch[1] === 'true' : false;

    details['Network Name (SSID)'] = ssid;
    details['Security'] = encryption;
    if (password) details['Password'] = password;
    if (hidden) details['Hidden Network'] = 'Yes';

    return {
      type: 'wifi',
      title: `Wi-Fi: ${ssid}`,
      displayValue: password ? `Password: ${password}` : 'Open Network',
      details,
      actionLabel: 'Copy Password',
    };
  }

  // 2. vCard: BEGIN:VCARD ...
  if (trimmed.includes('BEGIN:VCARD') || trimmed.includes('begin:vcard')) {
    const details: Record<string, string> = {};
    const getField = (reg: RegExp) => {
      const match = trimmed.match(reg);
      return match ? match[1].trim() : '';
    };

    const fn = getField(/^FN:(.*)$/im);
    const n = getField(/^N:(.*)$/im);
    const org = getField(/^ORG:(.*)$/im);
    const title = getField(/^TITLE:(.*)$/im);
    const tel = getField(/^TEL[^:]*:(.*)$/im);
    const email = getField(/^EMAIL[^:]*:(.*)$/im);
    const url = getField(/^URL:(.*)$/im);
    const note = getField(/^NOTE:(.*)$/im);

    let contactName = fn;
    if (!contactName && n) {
      contactName = n.split(';').reverse().filter(Boolean).join(' ');
    }
    contactName = contactName || 'vCard Contact';

    if (org) details['Organization'] = org;
    if (title) details['Title'] = title;
    if (tel) details['Phone'] = tel;
    if (email) details['Email'] = email;
    if (url) details['Website'] = url;
    if (note) details['Note'] = note;

    return {
      type: 'vcard',
      title: contactName,
      displayValue: [org, tel || email].filter(Boolean).join(' · ') || 'Digital Business Card',
      actionUrl: tel ? `tel:${tel}` : (email ? `mailto:${email}` : (url || undefined)),
      actionLabel: tel ? 'Call Contact' : (email ? 'Send Email' : 'View Contact'),
      details,
    };
  }

  // 3. Calendar: BEGIN:VCALENDAR or BEGIN:VEVENT
  if (trimmed.includes('BEGIN:VCALENDAR') || trimmed.includes('BEGIN:VEVENT')) {
    const details: Record<string, string> = {};
    const summaryMatch = trimmed.match(/^SUMMARY:(.*)$/im);
    const locMatch = trimmed.match(/^LOCATION:(.*)$/im);
    const descMatch = trimmed.match(/^DESCRIPTION:(.*)$/im);
    const dtStartMatch = trimmed.match(/^DTSTART[^:]*:(.*)$/im);

    const title = summaryMatch ? summaryMatch[1].trim() : 'Calendar Event';
    if (locMatch) details['Location'] = locMatch[1].trim();
    if (descMatch) details['Description'] = descMatch[1].trim();
    if (dtStartMatch) details['Starts'] = dtStartMatch[1].trim();

    return {
      type: 'calendar',
      title,
      displayValue: details['Location'] || details['Starts'] || 'Event details inside',
      details,
      actionLabel: 'Add to Calendar',
    };
  }

  // 4. URL
  if (/^https?:\/\//i.test(trimmed) || /^(www\.)/i.test(trimmed)) {
    const fullUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    try {
      const u = new URL(fullUrl);
      const host = u.hostname.replace(/^www\./, '');

      // Check specific platforms
      let type: QRType = 'url';
      if (host.includes('instagram.com')) type = 'instagram';
      else if (host.includes('facebook.com') || host.includes('fb.com')) type = 'facebook';
      else if (host.includes('youtube.com') || host.includes('youtu.be')) type = 'youtube';
      else if (host.includes('wa.me') || host.includes('whatsapp.com')) type = 'whatsapp';
      else if (host.includes('maps.google.com') || host.includes('goo.gl/maps')) type = 'location';

      return {
        type,
        title: host,
        displayValue: fullUrl,
        actionUrl: fullUrl,
        actionLabel: 'Open Link',
        details: { URL: fullUrl, Host: host, Path: u.pathname },
      };
    } catch {
      return {
        type: 'url',
        title: 'Web Link',
        displayValue: fullUrl,
        actionUrl: fullUrl,
        actionLabel: 'Open Link',
        details: { URL: fullUrl },
      };
    }
  }

  // 5. Phone: tel:+123456
  if (/^tel:/i.test(trimmed)) {
    const num = trimmed.replace(/^tel:/i, '').trim();
    return {
      type: 'phone',
      title: 'Phone Number',
      displayValue: num,
      actionUrl: `tel:${num}`,
      actionLabel: 'Call Phone',
      details: { Phone: num },
    };
  }

  // 6. Email: mailto:user@domain.com
  if (/^mailto:/i.test(trimmed)) {
    const clean = trimmed.replace(/^mailto:/i, '');
    const [recipient, queryString] = clean.split('?');
    const params = new URLSearchParams(queryString || '');
    const subject = params.get('subject') || '';
    const body = params.get('body') || '';

    const details: Record<string, string> = { Recipient: recipient };
    if (subject) details['Subject'] = subject;
    if (body) details['Message'] = body;

    return {
      type: 'email',
      title: `Email to ${recipient}`,
      displayValue: subject || recipient,
      actionUrl: trimmed,
      actionLabel: 'Compose Email',
      details,
    };
  }

  // 7. SMS: smsto:123456:message or sms:123456?body=...
  if (/^smsto:/i.test(trimmed) || /^sms:/i.test(trimmed)) {
    let phone = '';
    let message = '';
    if (trimmed.startsWith('smsto:') || trimmed.startsWith('SMSTO:')) {
      const parts = trimmed.substring(6).split(':');
      phone = parts[0] || '';
      message = parts.slice(1).join(':');
    } else {
      const match = trimmed.match(/^sms:([^?]+)(\?body=(.*))?/i);
      phone = match?.[1] || '';
      message = match?.[3] ? decodeURIComponent(match[3]) : '';
    }
    const details: Record<string, string> = { Recipient: phone };
    if (message) details['Message'] = message;

    return {
      type: 'sms',
      title: `SMS to ${phone}`,
      displayValue: message || phone,
      actionUrl: `sms:${phone}`,
      actionLabel: 'Send SMS',
      details,
    };
  }

  // 8. Location: geo:lat,lng
  if (/^geo:/i.test(trimmed)) {
    const coords = trimmed.replace(/^geo:/i, '').split('?')[0];
    const details = { Coordinates: coords };
    return {
      type: 'location',
      title: 'Geographic Location',
      displayValue: coords,
      actionUrl: `https://maps.google.com/?q=${coords}`,
      actionLabel: 'Open in Maps',
      details,
    };
  }

  // 9. Plain text fallback
  const firstLine = trimmed.split('\n')[0];
  const preview = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  return {
    type: 'text',
    title: 'Text Message',
    displayValue: preview || 'Plain text content',
    actionLabel: 'Copy Text',
    details: { Content: trimmed },
  };
}
