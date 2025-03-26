/**
 * @file Eyeball.tsx
 * @description Defines interfaces for Eyeball component data and props.
 */

/**
 * Interface defining the structure of a single data row for the Eyeball component.
 *
 * @interface EyeballPropsData
 */
export interface EyeballPropsData {
  /**
   * The resolved hostname (hostB).
   * @type {string}
   */
  resolvedHostname: string;

  /**
   * The role of the host.
   * @type {string}
   */
  hostRole: string;

  /**
   * The type of the host.
   * @type {string}
   */
  hostType: string;

  /**
   * The network protocol used.
   * @type {string}
   */
  networkProtocol: string;

  /**
   * The server port number.
   * @type {number}
   */
  serverPort: number;

  /**
   * The hostname (hostB).
   * @type {string}
   */
  hostname: string;

  /**
   * The geographical location of the host.
   * @type {string}
   */
  hostLocation: string;

  /**
   * The host group the host belongs to.
   * @type {string}
   */
  hostGroup: string;

  /**
   * The application ID.
   * @type {number}
   */
  applicationId: number;

  /**
   * Indicates whether XDR (Extended Detection and Response) is enabled.
   * @type {string}
   */
  xdrEnabled: string;

  /**
   * Indicates whether the application is malicious.
   * @type {string}
   */
  isMalicious: string;

  /**
   * Indicator of compromise ID.
   * @type {number}
   */
  iocId: number;

  /**
   * The Internet Service Provider name.
   * @type {string}
   */
  ispName: string;

  /**
   * The ISP organization.
   * @type {string}
   */
  ispOrganization: string;

  /**
   * The ISP autonomous system number.
   * @type {string}
   */
  ispAsn: string;

  /**
   * The number of server octets.
   * @type {number}
   */
  serverOctet: number;

  /**
   * Direction of the Packets.
   * @type {String}
   */
  DataDirection: String;
}

/**
 * Interface defining the props for the Eyeball component.
 *
 * @interface EyeballProps
 */
export interface EyeballProps {
  /**
   * An array of data rows, where each row conforms to the EyeballPropsData structure.
   * @type {EyeballPropsData[]}
   */
  ColumnData: EyeballPropsData[];
}


