registerProcessor('audioWorkletProcessor', class extends AudioWorkletProcessor {
  constructor() {
    super();
  }
  process(inputs, outputs, parameters) {
    if (inputs.length > 0 && inputs[0].length > 0) {
      if (inputs[0].length === 2) {
        for (var j = 0; j < inputs[0][0].length; j++) {
          inputs[0][0][j] = (inputs[0][0][j] + inputs[0][1][j]) / 2;
        }
      }
      this.port.postMessage(inputs[0][0], [inputs[0][0].buffer]);
    }
    return true;
  }
});
