import { LightningElement, wire } from 'lwc';

import getOrders
from '@salesforce/apex/DeliveryOrderService.getOrders';

import createOrder
from '@salesforce/apex/DeliveryOrderService.createOrder';

import deleteOrder
from '@salesforce/apex/DeliveryOrderService.deleteOrder';

import { refreshApex }
from '@salesforce/apex';

export default class DeliveryDashboard
extends LightningElement {


    clientId = '';

    orders;

    wiredOrdersResult;

    handleClientChange(event) {

        this.clientId = event.target.value;
    }

    @wire(getOrders)
    wiredOrders(result) {

        this.wiredOrdersResult = result;

        if(result.data) {

            this.orders = result.data;
        }

        else if(result.error) {

            console.error(result.error);
        }
    }

    async createNewOrder() {

        try {

            await createOrder({

                clientId: this.clientId
            });

            await refreshApex(
                this.wiredOrdersResult
            );

        }

        catch(error) {

            console.error(error);
        }
    }

    async deleteSelectedOrder(event) {

        const orderId =
            event.target.dataset.id;

        try {

            await deleteOrder({

                orderId: orderId
            });

            await refreshApex(
                this.wiredOrdersResult
            );

        }

        catch(error) {

            console.error(error);
        }
    }


}
