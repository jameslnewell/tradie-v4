
// prevent the jest output from being cleared
jest.mock('@tradie/cli-utils', () => ({
  clear: () => {/* do nothing */}
}));

import {Reporter} from './Reporter';

describe('Reporter', () => {
  it('should call .printStartOfReport() and .printEndOfReport() once when there is a single sync compilation', () => {
    const reporter = new Reporter();
    (reporter as any).printStartOfReport = jest.fn();
    (reporter as any).printEndOfReport = jest.fn();
    return reporter
      .started()
      .finished()
      .wait()
      .then(() => {
        expect((reporter as any).printStartOfReport).toHaveBeenCalledTimes(1);
        expect((reporter as any).printEndOfReport).toHaveBeenCalledTimes(1);
      });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple sync compilations running at the same time', () => {
    const reporter = new Reporter();
    (reporter as any).printStartOfReport = jest.fn();
    (reporter as any).printEndOfReport = jest.fn();
    return reporter
      .started()
      .started()
      .started()
      .finished()
      .finished()
      .finished()
      .wait()
      .then(() => {
        expect((reporter as any).printStartOfReport).toHaveBeenCalledTimes(1);
        expect((reporter as any).printEndOfReport).toHaveBeenCalledTimes(1);
      });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple sync compilations running one after each other in quick succession', () => {
    const reporter = new Reporter();
    (reporter as any).printStartOfReport = jest.fn();
    (reporter as any).printEndOfReport = jest.fn();
    return reporter
      .started()
      .finished()
      .started()
      .finished()
      .started()
      .finished()
      .wait()
      .then(() => {
        expect((reporter as any).printStartOfReport).toHaveBeenCalledTimes(1);
        expect((reporter as any).printEndOfReport).toHaveBeenCalledTimes(1);
      });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple async compilations running at the same time', () => {
    const reporter = new Reporter();
    (reporter as any).printStartOfReport = jest.fn();
    (reporter as any).printEndOfReport = jest.fn();

    reporter.started();
    setTimeout(() => reporter.started(), 10);
    setTimeout(() => reporter.started(), 20);
    setTimeout(() => reporter.finished(), 30);
    setTimeout(() => reporter.finished(), 40);
    setTimeout(() => reporter.finished(), 50);

    return reporter.wait().then(() => {
      expect((reporter as any).printStartOfReport).toHaveBeenCalledTimes(1);
      expect((reporter as any).printEndOfReport).toHaveBeenCalledTimes(1);
    });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple async compilations running one after each other in quick succession', () => {
    const reporter = new Reporter();
    (reporter as any).printStartOfReport = jest.fn();
    (reporter as any).printEndOfReport = jest.fn();

    reporter.started();
    setTimeout(() => reporter.finished(), 10);
    setTimeout(() => reporter.started(), 20);
    setTimeout(() => reporter.finished(), 30);
    setTimeout(() => reporter.started(), 40);
    setTimeout(() => reporter.finished(), 50);

    return reporter.wait().then(() => {
      expect((reporter as any).printStartOfReport).toHaveBeenCalledTimes(1);
      expect((reporter as any).printEndOfReport).toHaveBeenCalledTimes(1);
    });
  });

  it('should call .printStartOfReport() and .printEndOfReport() mutliple times when there are multiple async compilations running one after each other in slow succession', () => {
    const reporter = new Reporter({watch: true});
    (reporter as any).printStartOfReport = jest.fn();
    (reporter as any).printEndOfReport = jest.fn();

    reporter.started();
    setTimeout(() => reporter.finished(), 10);
    setTimeout(() => reporter.started(), 10 + 250 + 5*1);
    setTimeout(() => reporter.finished(), 10 + 500 + 5*2);
    setTimeout(() => reporter.started(), 10 + 750 + 5*3);
    setTimeout(() => reporter.finished().stopping(), 10 + 1000 + 5*4);

    return reporter.wait().then(() => {
      expect((reporter as any).printStartOfReport).toHaveBeenCalledTimes(3);
      expect((reporter as any).printEndOfReport).toHaveBeenCalledTimes(3);
    });
  });

  describe('.wait()', () => {
    describe('resolve', () => {
      it('should resolve when we are not watching and there are 0 compilations running', () => {
        const reporter = new Reporter();
        return expect(reporter.wait()).resolves.toBeUndefined();
      });

      it('should resolve when we are not watching and 1 compilation has finished running', () => {
        const reporter = new Reporter();
        reporter.started().finished();
        return expect(reporter.wait()).resolves.toBeUndefined();
      });

      it('should resolve when we are watching and .stopping() is called', () => {
        const reporter = new Reporter({watch: true});
        reporter.stopping();
        expect(reporter.wait()).resolves.toBeUndefined();
      });

      it('should resolve when we are watching and .stopping() is called after 1 compilations have finished running', () => {
        const reporter = new Reporter({watch: true});
        reporter
          .started()
          .finished()
          .stopping();
        expect(reporter.wait()).resolves.toBeUndefined();
      });
    });

    describe('reject', () => {
      it('should reject when we are not watching, an error is reported and 1 compilation has finished', () => {
        const reporter = new Reporter();

        reporter
          .started()
          .log({type: 'error', file: 'my-file.js', text: 'an error message'})
          .finished();

        return expect(reporter.wait()).rejects.toBeUndefined();
      });

      it('should reject when we are watching, an error is reported and .stopping() is called before compilation has finished', () => {
        const reporter = new Reporter({watch: true});

        reporter
          .started()
          .log({type: 'error', file: 'my-file.js', text: 'an error message'})
          .stopping()
          .finished();

        return expect(reporter.wait()).rejects.toBeUndefined();
      });

      it('should reject when we are watching, an error is reported and .stopping() is called after compilation has finished', () => {
        const reporter = new Reporter({watch: true});

        reporter
          .started()
          .log({type: 'error', file: 'my-file.js', text: 'an error message'})
          .finished()
          .stopping();

        return expect(reporter.wait()).rejects.toBeUndefined();
      });
    });
  });
});
