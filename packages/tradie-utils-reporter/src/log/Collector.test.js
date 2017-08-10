import Collector from './Collector';

describe('Logger', () => {
  describe('.clear()', () => {
    it('should clear the list', () => {
      const logger = new Collector();
      logger.info({message: 'Uh oh!'});
      expect(logger.logs).toHaveLength(1);
      logger.clear();
      expect(logger.logs).toHaveLength(0);
    });
  });

  describe('.info()', () => {
    it('should append a log', () => {
      const logger = new Collector();
      logger.info({message: 'Uh oh!'});
      expect(logger.logs).toContainEqual(
        expect.objectContaining({
          level: 'info',
          message: 'Uh oh!'
        })
      );
    });

    it('should append a log with data', () => {
      const logger = new Collector();
      logger.info({file: 'foobar', message: 'Uh oh!'});
      expect(logger.logs).toContainEqual(
        expect.objectContaining({
          level: 'info',
          message: 'Uh oh!',
          file: 'foobar'
        })
      );
    });
  });

  describe('.warn()', () => {
    it('should append a log', () => {
      const logger = new Collector();
      logger.warn({message: 'Uh oh!'});
      expect(logger.logs).toContainEqual(
        expect.objectContaining({
          level: 'warn',
          message: 'Uh oh!'
        })
      );
    });

    it('should append a log with data', () => {
      const logger = new Collector();
      logger.warn({file: 'foobar', message: 'Uh oh!'});
      expect(logger.logs).toContainEqual(
        expect.objectContaining({
          level: 'warn',
          message: 'Uh oh!',
          file: 'foobar'
        })
      );
    });
  });

  describe('.error()', () => {
    it('should append a log', () => {
      const logger = new Collector();
      logger.error({message: 'Uh oh!'});
      expect(logger.logs).toContainEqual(
        expect.objectContaining({
          level: 'error',
          message: 'Uh oh!'
        })
      );
    });

    it('should append a log with data', () => {
      const logger = new Collector();
      logger.error({file: 'foobar', message: 'Uh oh!'});
      expect(logger.logs).toContainEqual(
        expect.objectContaining({
          level: 'error',
          message: 'Uh oh!',
          file: 'foobar'
        })
      );
    });
  });
});
