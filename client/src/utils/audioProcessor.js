/**
 * Audio Processor Utility
 * Handles microphone capture and conversion to PCM16
 */

export class AudioProcessor {
    constructor(onAudioChunk) {
        this.onAudioChunk = onAudioChunk;
        this.audioContext = null;
        this.stream = null;
        this.processor = null;
    }

    async start() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });

            const source = this.audioContext.createMediaStreamSource(this.stream);

            // Create a ScriptProcessor for simplicity (OpenAI Realtime wants 24kHz PCM16)
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            this.processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcm16Data = this.floatTo16BitPCM(inputData);
                const base64 = this.arrayBufferToBase64(pcm16Data.buffer);
                this.onAudioChunk(base64);
            };

            return true;
        } catch (err) {
            console.error('Audio start error:', err);
            throw err;
        }
    }

    stop() {
        if (this.processor) {
            this.processor.disconnect();
            this.processor = null;
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    floatTo16BitPCM(input) {
        const output = new Int16Array(input.length);
        for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]));
            output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return output;
    }

    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
