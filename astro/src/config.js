import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_PATH = path.join(__dirname, '..');
export const PROD = process?.env?.NODE_ENV === 'production' ? true : false;


export const SITE_URL = 'https://strikebulb.com';
export const SITE_TITLE = 'StrikeBulb';
export const SITE_DESCRIPTION = 'Ideas that come up as a strike in a buld!';

export const GOOGLE_TAG_MANAGER_ID = {};
export const GOOGLE_TAG_MANAGER = "";

export const GOOGLE_AD_SENSE_ID = "";
export const GOOGLE_AD_SENSE = "";
