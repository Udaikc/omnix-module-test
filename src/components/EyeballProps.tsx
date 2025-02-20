/**
 the component mainly defines interface class / later will be moved
 to type
 */
export interface EyeballPropsRow {
    0: string;  // resolvedHostB
    1: string;  // hostRole
    2: string;  // hostType
    3: string;  // protocol
    4: number;  // serverPort
    5: string;  // hostB
    6: string;  // geoLocation
    7: string;  // hostGroup
    8: number;  // appId
    9: string;  // xdrEnabled
    10: string; // isMaliciousApp
    11: number; // iocId
    12: string; // ispName
    13: string; // ispAutonomousSystemOrg
    14: string; // ispAutonomousSystemNo
    15: number; // serverOctets
}

export interface EyeballProps {
    Matrix_Data:EyeballPropsRow[];
}
