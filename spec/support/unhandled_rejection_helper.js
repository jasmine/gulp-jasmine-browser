export function withUnhandledRejection() {
  let unhandledRejection;
  beforeEach(() => {
    unhandledRejection = jasmine.createSpy('unhandledRejection');
    if (!process.listeners('unhandledRejection').length) process.on('unhandledRejection', unhandledRejection);
  });

  afterEach(() => {
    process.removeListener(unhandledRejection, unhandledRejection);
  });
}
