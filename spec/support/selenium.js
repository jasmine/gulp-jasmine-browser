import seleniumStandalone from 'selenium-standalone';
import thenify from 'thenify';

export const install = thenify(seleniumStandalone.install);
export const start = thenify(seleniumStandalone.start);
