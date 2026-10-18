// The reporter ships browser-command types but omits declarations for its Node hooks.
declare module 'cypress-mochawesome-reporter/lib' {
  export function beforeRunHook(details: Cypress.BeforeRunDetails): Promise<void>;
  export function afterRunHook(): Promise<void>;
}
