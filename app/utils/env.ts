const envs = process.env;
const temp_env =  
  { 
  NEXT_PUBLIC_API_URL: envs.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_CLIENT_PORTAL_URL:envs.NEXT_PUBLIC_CLIENT_PORTAL_URL,
  NEXT_PUBLIC_CLIENT_COOKIE_PORTAL:envs.NEXT_PUBLIC_CLIENT_COOKIE_PORTAL,
  NEXT_PUBLIC_CLIENT_MEDIUM_URL:envs.NEXT_PUBLIC_CLIENT_MEDIUM_URL,
  NEXT_PUBLIC_API_ENCRYPT:envs.NEXT_PUBLIC_API_ENCRYPT,
 }  


 console.log("all_env",temp_env)
 const all_env = Object.freeze(temp_env) 
 export { all_env };

