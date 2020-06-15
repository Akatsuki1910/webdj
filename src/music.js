import DFT from "./dft";

export default class Music {
	audioContext;
	audioElement;
	audioSource;
	scriptProcessor;
	audioPrevInputs;
	audioPrevOutputs;
	audioWorkBuffer;

	constructor(nfb, fs, ts, ms) {
		this.NUM_SAMPLES = 1 << nfb; // 2^10 = 1024
		this.fs = fs;
		this.ts = ts;
		this.ms = ms;
	}

	////////////////////////////////////////////////////////////////
	// サウンド関連

	// イニシャライズされているか否か
	isInitializedAudio() {
		return this.audioContext != null;
	}

	// オーディオ関連の初期化
	initializeAudio() {
		// 処理用のバッファを初期化
		this.audioPrevInputs = [
			new Float32Array(this.NUM_SAMPLES),
			new Float32Array(this.NUM_SAMPLES)
		];
		this.audioPrevOutputs = [
			new Float32Array(this.NUM_SAMPLES),
			new Float32Array(this.NUM_SAMPLES)
		];
		this.audioWorkBuffer = new Float32Array(this.NUM_SAMPLES * 4); // FFT処理用のバッファ、処理サンプルの倍の複素数を収納できるようにする

		// WebAudio系の初期化
		this.audioContext = window.AudioContext != null ?
			new window.AudioContext() :
			new window.webkitAudioContext();

		this.scriptProcessor = this.audioContext.createScriptProcessor(this.NUM_SAMPLES, 2, 2);
		this.scriptProcessor.addEventListener("audioprocess", (e)=>this.onAudioProcess(e));
		this.scriptProcessor.connect(this.audioContext.destination);

		this.audioElement = new Audio();
		this.audioElement.loop = true;
		this.audioElement.autoplay = true;
		this.audioElement.addEventListener("timeupdate", (e)=>this.onUpdatedAudioTime(e));

		this.audioSource = this.audioContext.createMediaElementSource(this.audioElement);
		this.audioSource.connect(this.scriptProcessor);
	}

	// オーディオ関連の後処理
	terminateAudio() {
		this.audioElement.stop();
	}

	// 音声ファイルの再生時間が更新
	onUpdatedAudioTime(event) {
		this.ts.current.value = 1000 * (this.audioElement.currentTime / this.audioElement.duration);
	}

	//音楽をセット
	setAudio(audio){
		this.audioElement.src = audio;
		this.stopAudio();
		this.ts.current.value = 0;
	}

	// onMusicTime() {
	// 	if(this.audioElement != null){
	// 		this.audioElement.currentTime = this.ts.value * this.audioElement.duration / 1000;
	// 	}
	// }

	// 音声ファイルが再生中か否か
	isPlayAudio() {
		return !this.audioElement.paused;
	}

	// 音声ファイルを再生する
	playAudio() {
		if (!this.isPlayAudio()) {
			this.audioElement.play();
		}
	}

	// 音声ファイルを停止する
	stopAudio() {
		this.audioElement.pause();
	}

	// 音声の波形を処理
	onAudioProcess(event) {
		let input = event.inputBuffer;
		let output = event.outputBuffer;
		for (let i = 0; i < output.numberOfChannels; ++i) {
			let inputData = input.getChannelData(i);
			let outputData = output.getChannelData(i);
			let prevInput = this.audioPrevInputs[i];
			let prevOutput = this.audioPrevOutputs[i];

			// 前半に前回の入力波形、後半に今回の入力波形を実数を複素数に変換して作業用バッファに詰める
			for (let j = 0; j < this.NUM_SAMPLES; ++j) {
				// 前半
				let prevIndex = j * 2;
				this.audioWorkBuffer[prevIndex] = prevInput[j];
				this.audioWorkBuffer[prevIndex + 1] = 0.0;

				// 後半
				let nextIndex = (this.NUM_SAMPLES + j) * 2;
				this.audioWorkBuffer[nextIndex] = inputData[j];
				this.audioWorkBuffer[nextIndex + 1] = 0.0;

				// 今回の波形を保存
				prevInput[j] = inputData[j];
			}

			// FFTをかけて周波数
			DFT.fftHighSpeed(this.NUM_SAMPLES * 2, this.audioWorkBuffer);

			// 各周波数のボリュームを設定
			for (let j = 0; j < this.fs.length; ++j) {
				let volume = this.fs[j].current.value / 100.0;

				for (let k = 1 << j, kEnd = 1 << (j + 1); k < kEnd; ++k) {
					let positiveFq = k * 2;
					this.audioWorkBuffer[positiveFq] *= volume;
					this.audioWorkBuffer[positiveFq + 1] *= volume;

					let negativeFq = (this.NUM_SAMPLES * 2 - k) * 2;
					this.audioWorkBuffer[negativeFq] *= volume;
					this.audioWorkBuffer[negativeFq + 1] *= volume;
				}
			}

			// 直流部分のボリュームを設定
			let minFqVolume = this.fs[0].current.value / 100.0;
			this.audioWorkBuffer[0] *= minFqVolume;
			this.audioWorkBuffer[1] *= minFqVolume;

			// 最高周波数のボリュームを設定
			let maxFqVolume = this.fs[this.fs.length - 1].current.value / 100.0;
			this.audioWorkBuffer[this.NUM_SAMPLES * 2] *= maxFqVolume;
			this.audioWorkBuffer[this.NUM_SAMPLES * 2 + 1] *= maxFqVolume;

			// ビジュアライザの更新
			// updateFrequencyVisualizerParam(i, this.audioWorkBuffer);

			// 逆FFTをかける
			DFT.fftHighSpeed(this.NUM_SAMPLES * 2, this.audioWorkBuffer, true);

			// 前回の出力波形の後半と今回の出力波形の前半をクロスフェードさせて出力する
			let master = this.ms.current.value / 100.0;
			for (let j = 0; j < this.NUM_SAMPLES; ++j) {
				let prev = prevOutput[j] * (this.NUM_SAMPLES - j) / this.NUM_SAMPLES;
				let next = this.audioWorkBuffer[j * 2] * j / this.NUM_SAMPLES;
				outputData[j] = (prev + next) * master;
				prevOutput[j] = this.audioWorkBuffer[(this.NUM_SAMPLES + j) * 2];
			}
		}
	}
}