// WhatsApp Setup Functions for Doctor Dashboard

async function saveWhatsAppSettings() {
    const apiKey = document.getElementById('whatsappApiKey').value.trim();
    const enabled = document.getElementById('whatsappEnabled').checked;

    if (enabled && !apiKey) {
        alert('Please enter your WhatsApp API key');
        return;
    }

    try {
        const response = await AuthAPI.updateWhatsAppSettings(apiKey, enabled);

        if (response.success) {
            alert('✅ WhatsApp settings saved successfully!');
            if (enabled) {
                alert('You will now receive WhatsApp notifications when customers book consultations.');
            }
        } else {
            alert('❌ Failed to save settings: ' + response.message);
        }
    } catch (error) {
        console.error('Error saving WhatsApp settings:', error);
        alert('❌ Error saving settings: ' + error.message);
    }
}

// Add WhatsApp setup section to doctor dashboard
function addWhatsAppSetupUI() {
    const whatsappSection = document.getElementById('whatsappSection');
    if (!whatsappSection) {
        console.log('WhatsApp section not found');
        return;
    }

    const whatsappHTML = `
        <div class="whatsapp-setup-section">
            <h2>📱 WhatsApp Notifications</h2>
            <p style="color: #666; margin-bottom: 20px;">Get instant WhatsApp messages when customers book consultations - 100% FREE!</p>
            
            <div class="whatsapp-setup-card" style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #25D366;">
                <h3 style="color: #25D366; margin-top: 0;">🎯 One-Time Setup (2 minutes)</h3>
                
                <div class="setup-steps" style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                    <h4 style="margin-top: 0;">Follow these steps:</h4>
                    <ol style="line-height: 1.8;">
                        <li>Save this number in your WhatsApp contacts: <strong style="color: #25D366;">+34 644 34 87 08</strong></li>
                        <li>Send this exact message to that number:<br>
                            <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; margin: 5px 0;">I allow callmebot to send me messages</code>
                        </li>
                        <li>You'll receive a reply with your <strong>API key</strong> (looks like: 123456)</li>
                        <li>Copy that API key and paste it below</li>
                        <li>Enable notifications and click Save</li>
                    </ol>
                </div>
                
                <div class="form-group" style="margin: 15px 0;">
                    <label for="whatsappApiKey" style="display: block; margin-bottom: 5px; font-weight: 600;">WhatsApp API Key</label>
                    <input type="text" id="whatsappApiKey" placeholder="Enter your API key (e.g., 123456)" 
                           style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    <small style="color: #666; display: block; margin-top: 5px;">You'll receive this from CallMeBot after step 2</small>
                </div>
                
                <div class="form-group" style="margin: 15px 0;">
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" id="whatsappEnabled" style="margin-right: 10px; width: 18px; height: 18px;">
                        <span style="font-weight: 600;">Enable WhatsApp Notifications</span>
                    </label>
                </div>
                
                <button onclick="saveWhatsAppSettings()" class="btn-primary" style="width: 100%; padding: 12px; font-size: 16px; margin-top: 10px;">
                    💾 Save WhatsApp Settings
                </button>
                
                <div style="margin-top: 15px; padding: 10px; background: #e8f5e9; border-radius: 4px; border-left: 3px solid #4CAF50;">
                    <strong>✅ Benefits:</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Instant notifications on your phone</li>
                        <li>Never miss a booking</li>
                        <li>100% FREE - No charges ever</li>
                        <li>Works alongside dashboard notifications</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    whatsappSection.innerHTML = whatsappHTML;
    console.log('✅ WhatsApp setup UI added');
}

// Initialize WhatsApp setup when doctor dashboard loads
if (window.location.pathname.includes('doctor-dashboard')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const token = TokenManager.getToken();
            const doctorData = localStorage.getItem('petpal_currentDoctor');
            if (token && doctorData) {
                console.log('Initializing WhatsApp setup...');
                addWhatsAppSetupUI();
            }
        }, 2000);
    });
}
