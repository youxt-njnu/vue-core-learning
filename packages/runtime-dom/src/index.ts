export * from '@my-vue/shared';

import { nodeOpts } from './nodeOpts';
import { patchProp } from './patchProp';

export const options = Object.assign({patchProp}, nodeOpts)

export function createRenderer(options) {}

// createRender(options).render()