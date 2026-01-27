import { createAddress, fetchAddresses } from "../swipall/users";
import { AddressInterface } from "../swipall/users/user.types";


export default function useUserModel() {
    const getUserAddresses = async () => {
        try {
            const response = await fetchAddresses({ useAuthToken: true });
            return response;
        } catch (error) {
            console.error("Error fetching user addresses:", error);
            throw error;
        }
    }

    const createCustomerAddress = async (body: Partial<AddressInterface>) => {
        try {
            const response = await createAddress(body, { useAuthToken: true });
            return response;
        } catch (error) {
            console.error("Error creating address:", error);
            throw error;
        }
    }


    return {
        getUserAddresses,
        createCustomerAddress
    }
}