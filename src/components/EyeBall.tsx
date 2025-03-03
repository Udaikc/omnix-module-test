/**
 * Interface defining the structure of a single data row for the Eyeball component.
 */
export interface EyeballPropsData {
    /**
     * The resolved hostname (hostB).
     * @type {string}
     */
    0: string;
    /**
     * The role of the host.
     * @type {string}
     */
    1: string;
    /**
     * The type of the host.
     * @type {string}
     */
    2: string;
    /**
     * The network protocol used.
     * @type {string}
     */
    3: string;
    /**
     * The server port number.
     * @type {number}
     */
    4: number;
    /**
     * The hostname (hostB).
     * @type {string}
     */
    5: string;
    /**
     * The geographical location of the host.
     * @type {string}
     */
    6: string;
    /**
     * The host group the host belongs to.
     * @type {string}
     */
    7: string;
    /**
     * The application ID.
     * @type {number}
     */
    8: number;
    /**
     * Indicates whether XDR (Extended Detection and Response) is enabled.
     * @type {string}
     */
    9: string;
    /**
     * Indicates whether the application is malicious.
     * @type {string}
     */
    10: string;
    /**
     * Indicator of compromise ID.
     * @type {number}
     */
    11: number;
    /**
     * The Internet Service Provider name.
     * @type {string}
     */
    12: string;
    /**
     * The ISP organization.
     * @type {string}
     */
    13: string;
    /**
     * The ISP autonomous system number.
     * @type {string}
     */
    14: string;
    /**
     * The number of server octets.
     * @type {number}
     */
    15: number;
}

/**
 * Interface defining the props for the Eyeball component.
 */
export interface EyeballProps {
    /**
     * An array of data rows, where each row conforms to the EyeballPropsData structure.
     * @type {EyeballPropsData[]}
     */
    ColumnData: EyeballPropsData[];
}