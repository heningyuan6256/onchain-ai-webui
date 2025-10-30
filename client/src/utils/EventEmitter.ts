class EventEmitter {
  instrument: HTMLElement;
  constructor() {
    this.instrument = document.createElement("fakeelement");
  }

  addEventListener(event: any, callback: any) {
    this.instrument.addEventListener(event, callback);
  }

  removeEventListener(event: any, callback: any) {
    this.instrument.removeEventListener(event, callback);
  }

  dispatchEvent(event: any, detail = {}) {
    this.instrument.dispatchEvent(new CustomEvent(event, { detail }));
  }
}

export interface SpectrumTeamEvent<T> {
  detail: T;
  [k: string]: any;
}

export default new EventEmitter();
