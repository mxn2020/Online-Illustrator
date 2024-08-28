import 'server-only';

// Define the type for supported apps
export type AppName = 
  | 'illustrator'
  | 'landing';

// Define the structure of a dictionary
export type Dictionary = Record<string, string | Record<string, string>>;