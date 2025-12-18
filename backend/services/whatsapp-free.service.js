const https = require('https');

class WhatsAppFreeService {
    /**
     * Send WhatsApp notification using CallMeBot API (FREE)
     * Doctor must first register their WhatsApp:
     * 1. Save +34 644 34 87 08 in contacts
     * 2. Send: "I allow callmebot to send me messages"
     * 3. Receive API key
     */
    async sendConsultationNotification(doctor, consultation) {
        // Check if doctor has WhatsApp configured
        if (!doctor.whatsappEnabled || !doctor.whatsappApiKey || !doctor.phone) {
            console.log(`⏭️ WhatsApp not configured for Dr. ${doctor.name}`);
            return { success: false, reason: 'WhatsApp not configured' };
        }

        try {
            const message = this.formatMessage(doctor, consultation);

            // Clean phone number (remove spaces, dashes, etc.)
            const phone = doctor.phone.replace(/[^0-9]/g, '');

            // CallMeBot API endpoint (FREE)
            const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${doctor.whatsappApiKey}`;

            console.log(`📱 Sending WhatsApp to Dr. ${doctor.name} (${phone})...`);

            return new Promise((resolve, reject) => {
                https.get(url, (res) => {
                    let data = '';

                    res.on('data', (chunk) => {
                        data += chunk;
                    });

                    res.on('end', () => {
                        if (res.statusCode === 200) {
                            console.log(`✅ WhatsApp sent successfully to Dr. ${doctor.name}`);
                            resolve({ success: true, response: data });
                        } else {
                            console.error(`❌ WhatsApp failed: HTTP ${res.statusCode}`);
                            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                        }
                    });
                }).on('error', (error) => {
                    console.error(`❌ WhatsApp error:`, error.message);
                    reject(error);
                });
            });
        } catch (error) {
            console.error('WhatsApp notification error:', error.message);
            return { success: false, error: error.message };
        }
    }

    formatMessage(doctor, consultation) {
        const date = new Date(consultation.appointmentDate).toLocaleDateString('en-IN');

        return `🔔 *New Consultation Booking*

Hello Dr. ${doctor.name}!

You have a new consultation:

👤 *Patient*: ${consultation.customerName}
📱 *Phone*: ${consultation.customerPhone}
📧 *Email*: ${consultation.customerEmail}

🐾 *Pet Details*:
   Name: ${consultation.petName}
   Type: ${consultation.petType}
   Age: ${consultation.petAge || 'Not specified'}
   Breed: ${consultation.petBreed || 'Not specified'}

📅 *Appointment*:
   Date: ${date}
   Time: ${consultation.appointmentTime}

📝 *Symptoms/Issue*:
${consultation.symptoms}

💰 *Fee*: ₹${consultation.fee}

Please login to your dashboard to manage this consultation.

Thank you!
PetPal Team`;
    }
}

module.exports = new WhatsAppFreeService();
