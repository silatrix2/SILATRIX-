case `${prefix}trt`:
case `${prefix}translate`: {
    if (!text) return reply('⚠️ Tafadhali weka maandishi ya kutafsiri.\nMfano: .trt en Hello world');
    
    const langMap = {
        'sw': 'Kiswahili',
        'en': 'Kiingereza',
        'fr': 'Kifaransa',
        'es': 'Kihispania',
        'ar': 'Kiarabu'
    };
    
    let targetLang = 'sw'; // default
    let textToTranslate = text;
    
    // Check if language is specified (e.g., "en Hello")
    const langMatch = text.match(/^(\w{2})\s+(.+)/);
    if (langMatch && langMap[langMatch[1]]) {
        targetLang = langMatch[1];
        textToTranslate = langMatch[2];
    }
    
    try {
        const translation = await translateText(textToTranslate, targetLang);
        reply(`🔤 *Original:* ${textToTranslate}\n🌐 *Tafsiri (${langMap[targetLang]}):* ${translation}`);
    } catch (error) {
        reply('❌ Imeshindwa kutafsiri. Tafadhali jaribu tena baadaye.');
    }
    break;
}
