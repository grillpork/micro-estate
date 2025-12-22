/**
 * Base email template with common layout and styles
 */

interface BaseTemplateOptions {
  content: string;
  backgroundColor?: string;
  borderColor?: string;
}

const baseStyles = `
  body { 
    font-family: 'Helvetica Neue', Arial, sans-serif; 
    line-height: 1.6; 
    color: #333;
    margin: 0;
    padding: 0;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    padding: 20px; 
  }
  .header { 
    text-align: center; 
    padding: 20px 0; 
  }
  .logo { 
    font-size: 28px; 
    font-weight: bold; 
    color: #2563eb; 
  }
  .content { 
    padding: 30px; 
    border-radius: 12px; 
  }
  .button { 
    display: inline-block; 
    background: #2563eb; 
    color: white !important; 
    padding: 14px 28px; 
    border-radius: 8px; 
    text-decoration: none;
    font-weight: 600;
    margin: 20px 0;
  }
  .button:hover {
    background: #1d4ed8;
  }
  .footer { 
    text-align: center; 
    padding: 20px; 
    color: #64748b; 
    font-size: 14px; 
  }
  .text-muted {
    color: #64748b;
    font-size: 14px;
  }
  .info-box {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin: 20px 0;
  }
`;

export function baseTemplate({
  content,
  backgroundColor = "#f8fafc",
  borderColor,
}: BaseTemplateOptions): string {
  const borderStyle = borderColor ? `border: 1px solid ${borderColor};` : "";

  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${baseStyles}</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo">🏠 Micro Estate</div>
      </div>
      <div class="content" style="background: ${backgroundColor}; ${borderStyle}">
        ${content}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Micro Estate. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
  `.trim();
}
