import { SARAK_BUILD_INFO } from './buildInfo';

export const SARAK_BUILD_INFO_ATTRIBUTE = JSON.stringify({
    libVersion: SARAK_BUILD_INFO.libVersion,
    baseCommitShort: SARAK_BUILD_INFO.baseCommitShort,
    builtAt: SARAK_BUILD_INFO.builtAt,
});
