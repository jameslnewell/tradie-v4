import Reporter from '.';

describe('Reporter', () => {
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

  it('should resolve immediately when there are no compilations running', () => {
    const reporter = new Reporter();
    return reporter.wait();
  });

  it('should resolve when finished when there is already a compilation running', () => {
    const reporter = new Reporter();
    return reporter.started().finished().wait();
  });

  it('should resolve immediately when stopped while watching', () => {
    const reporter = new Reporter({watching: true});
    return reporter.stop().wait();
  });

  it('should resolve when compilations finish while watching and there is already a compilation running', () => {
    const reporter = new Reporter({watching: true});
    return reporter.started().finished().stop().wait();
  });
});
