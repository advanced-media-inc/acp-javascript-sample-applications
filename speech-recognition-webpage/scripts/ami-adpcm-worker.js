onmessage = (event) => {
  var adpcmAarrayBuffer = toADPCM(event.data[0], event.data[1]);
  postMessage(adpcmAarrayBuffer, [adpcmAarrayBuffer]);
}

/**
 * モノラルの32bitリニアPCMデータをDVI/IMA ADPCM (AMI 独自形式)に変換します。
 * @param {Float32Array} float32PcmData PCMデータ
 * @param {number} audioSamplesPerSec サンプリングレート
 * @returns 変換結果
 */
function toADPCM(float32PcmData, audioSamplesPerSec) {

  // ADPCM用に後で4で割り切れるように偶数個に調整
  var bufferLen = float32PcmData.length;
  if (bufferLen % 2 !== 0) {
    bufferLen++;
  }

  // 32bit float リニアPCMを16bit リニアPCMに変換
  var pcmData = new Uint8Array(bufferLen * 2);
  var index = 0;
  for (var audioDataIndex = 0; audioDataIndex < float32PcmData.length; audioDataIndex++) {
    var pcm = float32PcmData[audioDataIndex] * 32768 | 0; // 小数 (0.0～1.0) を 整数 (-32768～32767) に変換...
    if (pcm > 32767) {
      pcm = 32767;
    } else
      if (pcm < -32768) {
        pcm = -32768;
      }

    // 16bit リニアPCM(リトルエンディアン)
    pcmData[index++] = (pcm) & 0xFF;
    pcmData[index++] = (pcm >> 8) & 0xFF;
  }

  float32PcmData = null;

  let adpcmData = new Uint8Array(16 + pcmData.length / 4);
  let adpcmDataIndex = 0;

  // DVI/IMA ADPCM (AMI 独自形式)のヘッダー
  adpcmData[adpcmDataIndex++] = 0x23; // '#'
  adpcmData[adpcmDataIndex++] = 0x21; // '!'
  adpcmData[adpcmDataIndex++] = 0x41; // 'A'
  adpcmData[adpcmDataIndex++] = 0x44; // 'D'
  adpcmData[adpcmDataIndex++] = 0x50; // 'P'
  adpcmData[adpcmDataIndex++] = 0x0A; // '\n'
  adpcmData[adpcmDataIndex++] = (audioSamplesPerSec & 0xFF);
  adpcmData[adpcmDataIndex++] = ((audioSamplesPerSec >> 8) & 0xFF);
  adpcmData[adpcmDataIndex++] = 1; // channels
  adpcmData[adpcmDataIndex++] = 2; // type
  adpcmData[adpcmDataIndex++] = 0;
  adpcmData[adpcmDataIndex++] = 0;
  adpcmData[adpcmDataIndex++] = 1;
  adpcmData[adpcmDataIndex++] = 2;
  adpcmData[adpcmDataIndex++] = 0;
  adpcmData[adpcmDataIndex++] = 0;

  // DVI/IMA ADPCM データ
  ima_state_ = 1;
  ima_state_last_ = 0;
  ima_state_step_index_ = 0;
  var oldData = new DataView(pcmData.buffer, pcmData.byteOffset, pcmData.byteLength);
  for (var i = 0; i < oldData.byteLength; i += 4) {
    var pcm1 = oldData.getInt16(i, true);
    var pcm2 = oldData.getInt16(i + 2, true);

    var ima1 = linear2ima_(pcm1);
    var ima2 = linear2ima_(pcm2);
    adpcmData[adpcmDataIndex++] = ((ima1 << 4) | ima2);
  }

  pcmData = null;
  return adpcmData.buffer;
};

// <!-- for ADPCM packing
var ima_step_size_table_ = [
  7, 8, 9, 10, 11, 12, 13, 14, 16, 17,
  19, 21, 23, 25, 28, 31, 34, 37, 41, 45,
  50, 55, 60, 66, 73, 80, 88, 97, 107, 118,
  130, 143, 157, 173, 190, 209, 230, 253, 279, 307,
  337, 371, 408, 449, 494, 544, 598, 658, 724, 796,
  876, 963, 1060, 1166, 1282, 1411, 1552, 1707, 1878, 2066,
  2272, 2499, 2749, 3024, 3327, 3660, 4026, 4428, 4871, 5358,
  5894, 6484, 7132, 7845, 8630, 9493, 10442, 11487, 12635, 13899,
  15289, 16818, 18500, 20350, 22385, 24623, 27086, 29794, 32767
];
var ima_step_adjust_table_ = [
  -1, -1, -1, -1, 2, 4, 6, 8
];
var ima_state_;
var ima_state_last_;
var ima_state_step_index_;
function linear2ima_(pcm) {
  var step_size = ima_step_size_table_[ima_state_step_index_];
  var diff = pcm - ima_state_last_;
  var ima = 0x00;
  if (diff < 0) {
    ima = 0x08;
    diff = -diff;
  }
  var vpdiff = 0;
  if (diff >= step_size) {
    ima |= 0x04;
    diff -= step_size;
    vpdiff += step_size;
  }
  step_size >>= 1;
  if (diff >= step_size) {
    ima |= 0x02;
    diff -= step_size;
    vpdiff += step_size;
  }
  step_size >>= 1;
  if (diff >= step_size) {
    ima |= 0x01;
    vpdiff += step_size;
  }
  step_size >>= 1;
  vpdiff += step_size;
  if ((ima & 0x08) != 0) {
    ima_state_last_ -= vpdiff;
  } else {
    ima_state_last_ += vpdiff;
  }
  if (ima_state_last_ > 32767) {
    ima_state_last_ = 32767;
  } else
    if (ima_state_last_ < -32768) {
      ima_state_last_ = -32768;
    }
  ima_state_step_index_ += ima_step_adjust_table_[ima & 0x07];
  if (ima_state_step_index_ < 0) {
    ima_state_step_index_ = 0;
  } else
    if (ima_state_step_index_ > 88) {
      ima_state_step_index_ = 88;
    }
  return ima;
}
	// -->
