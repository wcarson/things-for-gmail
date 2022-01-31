class Utils {
  /**
   * Returns the specified form value.
   *
   * @param {EventObject} event Event containing the form vales
   * @param {string} attribute The name of the form field.
   * @returns {string} Form value or empty string if not available.
   */
  getFormValue(event: GoogleAppsScript.Addons.EventObject, attribute: string): string {
    const form = event.commonEventObject?.formInputs;

    // @ts-expect-error event type definition doesn't match actual object
    return form?.[attribute]?.stringInputs?.value?.[0] || '';
  }
}

export default new Utils();
