import { fetchAddressesServer, createAddressServer } from "../swipall/users/server";
import { AddressInterface } from "../swipall/users/user.types";
import { isPrerenderBailout } from "../utils";


export default function useUserModel() {
    const getUserAddresses = async () => {
        try {
            const response = await fetchAddressesServer();
            return response;
        } catch (error) {
            if (!isPrerenderBailout(error)) {
                console.error("Error fetching user addresses:", error);
            }
            throw error;
        }
    }

    const createCustomerAddress = async (body: Partial<AddressInterface>) => {
        try {
            const response = await createAddressServer(body);
            return response;
        } catch (error) {
            if (!isPrerenderBailout(error)) {
                console.error("Error creating address:", error);
            }
            throw error;
        }
    }


    return {
        getUserAddresses,
        createCustomerAddress
    }
}