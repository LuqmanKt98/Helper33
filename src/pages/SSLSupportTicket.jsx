import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Mail, FileText, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function SSLSupportTicket() {
  const [copied, setCopied] = useState(false);

  const supportEmail = `Subject: 🚨 URGENT - SSL Configuration Error Blocking Site Access (thedobrylife.com)

Priority: HIGH - Site Down

Dear Base44 Support Team,

I am experiencing a critical SSL/TLS configuration error that is preventing ALL users from accessing my published application.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CRITICAL ISSUE DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain: thedobrylife.com
Error: ERR_SSL_VERSION_OR_CIPHER_MISMATCH
Status: Site completely inaccessible to all users
Impact: Production site cannot be launched

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 ERROR DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Browser Error Message:
"The connection for this site is not secure"
"thedobrylife.com uses an unsupported protocol"
Error Code: ERR_SSL_VERSION_OR_CIPHER_MISMATCH

Browsers Tested:
- Google Chrome (Latest): ❌ FAILED
- Firefox (Latest): ❌ FAILED  
- Safari (Latest): ❌ FAILED
- Edge (Latest): ❌ FAILED

All browsers show the same SSL protocol error.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛠️ REQUIRED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please urgently perform the following server configurations:

1. SSL/TLS Protocol Configuration:
   ✓ ENABLE: TLS 1.2 (minimum required)
   ✓ ENABLE: TLS 1.3 (recommended)
   ✗ DISABLE: SSLv2, SSLv3, TLS 1.0, TLS 1.1 (deprecated/insecure)

2. SSL Certificate Verification:
   ✓ Verify certificate is properly installed for thedobrylife.com
   ✓ Ensure certificate is NOT expired
   ✓ Verify certificate chain includes intermediate certificates
   ✓ Confirm certificate matches domain name exactly

3. Cipher Suite Configuration:
   ✓ Enable modern, secure cipher suites only
   ✓ Recommended ciphers:
      - TLS_AES_128_GCM_SHA256
      - TLS_AES_256_GCM_SHA384
      - TLS_CHACHA20_POLY1305_SHA256
      - ECDHE-RSA-AES128-GCM-SHA256
      - ECDHE-RSA-AES256-GCM-SHA384

4. Server Configuration:
   ✓ Restart web server after configuration changes
   ✓ Clear any SSL/TLS configuration caches
   ✓ Verify HTTPS port 443 is properly configured

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 TECHNICAL ENVIRONMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Platform: Base44
App Name: DobryLife
Primary Domain: thedobrylife.com
Alternative Domain: dobrylife.com
Base44 Project URL: [Your project URL]

Current DNS Configuration:
- A Record: @ → [pointing to Base44]
- CNAME: www → [pointing to Base44]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ URGENCY & BUSINESS IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is a production-blocking issue:
• Site launch is delayed
• Users cannot access the application
• Business operations are affected
• Need resolution within 24 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 ATTACHMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

I have attached:
1. Screenshot of the SSL error in browser
2. Browser console error logs
3. SSL test results from ssllabs.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 VERIFICATION AFTER FIX
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

After implementing the fix, please verify:
1. Site accessible via HTTPS in all major browsers
2. SSL Labs test shows grade A or higher
3. No mixed content warnings
4. Certificate chain is complete

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📞 CONTACT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please contact me immediately when:
• You begin working on this issue
• You need additional information
• The issue is resolved

Preferred Contact: [Your email]
Phone: [Your phone if urgent]
Availability: [Your timezone and hours]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Thank you for your urgent attention to this critical issue. I appreciate your help in resolving this as quickly as possible.

Best regards,
[Your Name]
[Your Company/Organization]
[Contact Information]`;

  const technicalDetails = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL DETAILS FOR SUPPORT TEAM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error Code: ERR_SSL_VERSION_OR_CIPHER_MISMATCH

Root Cause Analysis:
This error occurs when the server's SSL/TLS configuration uses protocols or cipher suites 
that are not supported by modern browsers.

Common Causes:
1. Server only supporting TLS 1.0 or TLS 1.1 (deprecated since 2020)
2. Using weak or deprecated cipher suites
3. SSL certificate improperly installed or incomplete certificate chain
4. Server configuration not updated to modern security standards

Required Server Configuration (for support team):

For Nginx:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
ssl_prefer_server_ciphers off;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_stapling on;
ssl_stapling_verify on;
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For Apache:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SSLProtocol -all +TLSv1.2 +TLSv1.3
SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384
SSLHonorCipherOrder off
SSLSessionTickets off
SSLUseStapling on
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Certificate Requirements:
✓ Valid for thedobrylife.com (exact match)
✓ Not expired (check expiration date)
✓ Includes full certificate chain (root + intermediates)
✓ From a trusted Certificate Authority (e.g., Let's Encrypt, DigiCert)
✓ Uses SHA-256 or better signature algorithm

Browser Compatibility Requirements:
✓ TLS 1.2 minimum (Chrome 29+, Firefox 27+, Safari 7+, Edge 12+)
✓ TLS 1.3 recommended (Chrome 70+, Firefox 63+, Safari 12.1+, Edge 79+)
✓ Modern cipher suites with forward secrecy

Testing Commands (for support team):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test TLS versions supported
openssl s_client -connect thedobrylife.com:443 -tls1_2
openssl s_client -connect thedobrylife.com:443 -tls1_3

# Verify certificate chain
openssl s_client -connect thedobrylife.com:443 -showcerts

# Check cipher suites
nmap --script ssl-enum-ciphers -p 443 thedobrylife.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Expected Results After Fix:
✓ SSL Labs Test: Grade A or A+
✓ TLS 1.2: Enabled ✓
✓ TLS 1.3: Enabled ✓
✓ Weak Protocols: Disabled ✓
✓ Certificate: Valid ✓
✓ Certificate Chain: Complete ✓
✓ Forward Secrecy: Yes ✓

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-full mb-4 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SSL Support Ticket Generator</h1>
          <p className="text-lg text-gray-600">Ready-to-send support request for Base44</p>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => handleCopy(supportEmail)}
            className="h-auto py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            <div className="flex flex-col items-center gap-2">
              {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
              <span className="font-semibold">Copy Support Email</span>
            </div>
          </Button>

          <Button
            asChild
            className="h-auto py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <a href={`mailto:support@base44.com?subject=${encodeURIComponent('🚨 URGENT - SSL Configuration Error (thedobrylife.com)')}&body=${encodeURIComponent(supportEmail)}`}>
              <div className="flex flex-col items-center gap-2">
                <Mail className="w-6 h-6" />
                <span className="font-semibold">Send via Email</span>
              </div>
            </a>
          </Button>

          <Button
            onClick={() => handleCopy(technicalDetails)}
            variant="outline"
            className="h-auto py-4 border-2"
          >
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-6 h-6" />
              <span className="font-semibold">Copy Tech Details</span>
            </div>
          </Button>
        </div>

        {/* Support Email Template */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-red-600" />
              Support Email Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={supportEmail}
              readOnly
              className="font-mono text-xs h-96 mb-4"
            />
            <div className="flex gap-3">
              <Button
                onClick={() => handleCopy(supportEmail)}
                className="flex-1"
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy Email
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
              >
                <a href={`mailto:support@base44.com?subject=${encodeURIComponent('🚨 URGENT - SSL Configuration Error (thedobrylife.com)')}&body=${encodeURIComponent(supportEmail)}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Now
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Technical Details (Attach to Email)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={technicalDetails}
              readOnly
              className="font-mono text-xs h-96 mb-4"
            />
            <Button
              onClick={() => handleCopy(technicalDetails)}
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Technical Details
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">📋 How to Submit Your Support Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                <strong>Attach Screenshots</strong>
                <p className="ml-6 text-sm text-gray-600">Include the SSL error screenshot you already have</p>
              </li>
              <li>
                <strong>Copy the Support Email</strong>
                <p className="ml-6 text-sm text-gray-600">Click "Copy Email" button above</p>
              </li>
              <li>
                <strong>Send to Base44 Support</strong>
                <p className="ml-6 text-sm text-gray-600">Email: support@base44.com (or click "Send via Email" button)</p>
              </li>
              <li>
                <strong>Include Technical Details</strong>
                <p className="ml-6 text-sm text-gray-600">Paste the technical details as additional information</p>
              </li>
              <li>
                <strong>Request Urgent Priority</strong>
                <p className="ml-6 text-sm text-gray-600">Mention this is production-blocking</p>
              </li>
              <li>
                <strong>Follow Up</strong>
                <p className="ml-6 text-sm text-gray-600">If no response in 4 hours, send a follow-up</p>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Expected Timeline */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">⏰ Expected Response Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <strong>Initial Response:</strong> 1-4 hours (acknowledgment)
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <strong>Investigation:</strong> 2-4 hours
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div>
                  <strong>Implementation:</strong> 2-6 hours
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div>
                  <strong>Total Resolution:</strong> 4-12 hours (typically)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900">📞 Base44 Support Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> support@base44.com</p>
              <p><strong>Priority:</strong> Mark as URGENT / HIGH</p>
              <p><strong>Subject:</strong> 🚨 URGENT - SSL Configuration Error (thedobrylife.com)</p>
              <p className="text-sm text-purple-800 mt-4">
                💡 <strong>Tip:</strong> Including detailed technical information (as provided above) helps support resolve the issue faster!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}