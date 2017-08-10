import Reporter from '.';

describe.skip('Reporter', () => {
  it('should call .printStartOfReport() and .printEndOfReport() once when there is a single sync compilation', () => {
    const reporter = new Reporter();
    reporter.printStartOfReport = jest.fn();
    reporter.printEndOfReport = jest.fn();
    return reporter.started().finished().wait().then(() => {
      expect(reporter.printStartOfReport).toHaveBeenCalledTimes(1);
      expect(reporter.printEndOfReport).toHaveBeenCalledTimes(1);
    });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple sync compilations running at the same time', () => {
    const reporter = new Reporter();
    reporter.printStartOfReport = jest.fn();
    reporter.printEndOfReport = jest.fn();
    return reporter
      .started()
      .started()
      .started()
      .finished()
      .finished()
      .finished()
      .wait()
      .then(() => {
        expect(reporter.printStartOfReport).toHaveBeenCalledTimes(1);
        expect(reporter.printEndOfReport).toHaveBeenCalledTimes(1);
      });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple sync compilations running one after each other in quick succession', () => {
    const reporter = new Reporter();
    reporter.printStartOfReport = jest.fn();
    reporter.printEndOfReport = jest.fn();
    return reporter
      .started()
      .finished()
      .started()
      .finished()
      .started()
      .finished()
      .wait()
      .then(() => {
        expect(reporter.printStartOfReport).toHaveBeenCalledTimes(1);
        expect(reporter.printEndOfReport).toHaveBeenCalledTimes(1);
      });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple async compilations running at the same time', () => {
    const reporter = new Reporter();
    reporter.printStartOfReport = jest.fn();
    reporter.printEndOfReport = jest.fn();

    reporter.started();
    setTimeout(() => reporter.started(), 10);
    setTimeout(() => reporter.started(), 20);
    setTimeout(() => reporter.finished(), 30);
    setTimeout(() => reporter.finished(), 40);
    setTimeout(() => reporter.finished(), 50);

    return reporter.wait().then(() => {
      expect(reporter.printStartOfReport).toHaveBeenCalledTimes(1);
      expect(reporter.printEndOfReport).toHaveBeenCalledTimes(1);
    });
  });

  it('should call .printStartOfReport() and .printEndOfReport() once when there are multiple async compilations running one after each other in quick succession', () => {
    const reporter = new Reporter();
    reporter.printStartOfReport = jest.fn();
    reporter.printEndOfReport = jest.fn();

    reporter.started();
    setTimeout(() => reporter.finished(), 10);
    setTimeout(() => reporter.started(), 20);
    setTimeout(() => reporter.finished(), 30);
    setTimeout(() => reporter.started(), 40);
    setTimeout(() => reporter.finished(), 50);

    return reporter.wait().then(() => {
      expect(reporter.printStartOfReport).toHaveBeenCalledTimes(1);
      expect(reporter.printEndOfReport).toHaveBeenCalledTimes(1);
    });
  });

  it('should call .printStartOfReport() and .printEndOfReport() mutliple times when there are multiple async compilations running one after each other in slow succession', () => {
    const reporter = new Reporter({watching: true});
    reporter.printStartOfReport = jest.fn();
    reporter.printEndOfReport = jest.fn();

    reporter.started();
    setTimeout(() => reporter.finished(), 10);
    setTimeout(() => reporter.started(), 150);
    setTimeout(() => reporter.finished(), 160);
    setTimeout(() => reporter.started(), 270);
    setTimeout(() => reporter.finished().stop(), 280);

    return reporter.wait().then(() => {
      expect(reporter.printStartOfReport).toHaveBeenCalledTimes(3);
      expect(reporter.printEndOfReport).toHaveBeenCalledTimes(3);
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

      it('should resolve when we are watching and .stop() is called', () => {
        const reporter = new Reporter({watching: true});
        reporter.stop();
        expect(reporter.wait()).resolves.toBeUndefined();
      });

      it('should resolve when we are watching and .stop() is called after 1 compilations have finished running', () => {
        const reporter = new Reporter({watching: true});
        reporter.started().finished().stop();
        expect(reporter.wait()).resolves.toBeUndefined();
      });
    });

    describe('reject', () => {
      it('should reject when we are not watching, an error is reported and 1 compilation has finished', () => {
        const reporter = new Reporter();

        reporter.started().error('my-file.js', 'an error message').finished();

        return expect(reporter.wait()).rejects.toBeUndefined();
      });

      it('should reject when we are watching, an error is reported and .stop() is called before compilation has finished', () => {
        const reporter = new Reporter({watching: true});

        reporter
          .started()
          .error('my-file.js', 'an error message')
          .stop()
          .finished();

        return expect(reporter.wait()).rejects.toBeUndefined();
      });

      it('should reject when we are watching, an error is reported and .stop() is called after compilation has finished', () => {
        const reporter = new Reporter({watching: true});

        reporter
          .started()
          .error('my-file.js', 'an error message')
          .finished()
          .stop();

        return expect(reporter.wait()).rejects.toBeUndefined();
      });
    });
  });
});
