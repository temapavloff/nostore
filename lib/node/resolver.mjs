/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable import/extensions */
import { isBuiltin } from 'node:module';
import { dirname } from 'node:path';
import { cwd } from 'node:process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import resolveCallback from 'resolve/async.js';

const resolveAsync = promisify(resolveCallback);

const baseURL = pathToFileURL(cwd() + '/').href;

export async function resolve(specifier, context, next) {
  const { parentURL = baseURL } = context;

  if (isBuiltin(specifier)) {
    return next(specifier, context);
  }

  // `resolveAsync` works with paths, not URLs
  if (specifier.startsWith('file://')) {
    specifier = fileURLToPath(specifier);
  }
  const parentPath = fileURLToPath(parentURL);

  let url;
  try {
    let isFakeModule = false;
    const resolution = await resolveAsync(specifier, {
      basedir: dirname(parentPath),
      // For whatever reason, --experimental-specifier-resolution=node doesn't search for .mjs extensions
      // but it does search for index.mjs files within directories
      extensions: ['.tsm', '.mjs', '.tsx', '.jsx', '.ts', '.js', '.json', '.node'],
      preserveSymlinks: false,

      // packageFilter: (pkg) => {
      //   const clone = structuredClone(pkg);

      //   if (typeof clone.module === 'string') {
      //     clone.main = clone.module;
      //     isFakeModule = true;
      //   }

      //   return clone;
      // },
    });
    url = pathToFileURL(resolution).href;

    if (isFakeModule) {
      return {
        format: 'module',
        shortCircuit: true,
        url,
      };
    }
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      // Match Node's error code
      error.code = 'ERR_MODULE_NOT_FOUND';
    }
    throw error;
  }

  return next(url, context);
}
