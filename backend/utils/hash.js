// Source: hash.js from idg2100.backend.lt

import crypto from "node:crypto";

const { APP_SALT: salt } = process.env;

export function hashPwd(pwd){
	const s2hash = pwd + salt;
	return crypto.createHash("md5").update(s2hash).digest("hex").toString();
}

export function checkPwd(pwd, existingHash){
	return hashPwd(pwd) === existingHash;
}