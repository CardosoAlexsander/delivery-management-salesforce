import { LightningElement, wire } from 'lwc';

import getOrders
from '@salesforce/apex/DeliveryOrderService.getOrders';

import createOrder
from '@salesforce/apex/DeliveryOrderService.createOrder';

import deleteOrder
from '@salesforce/apex/DeliveryOrderService.deleteOrder';

import getOrderItems
from '@salesforce/apex/DeliveryOrderItemService.getOrderItems';

import addOrderItem
from '@salesforce/apex/DeliveryOrderItemService.addOrderItem';

import { refreshApex }
from '@salesforce/apex';

import updateOrderTotal
from '@salesforce/apex/DeliveryOrderService.updateOrderTotal';

import getMenuItems
from '@salesforce/apex/MenuItemService.getMenuItems';

import updateOrderStatus
from '@salesforce/apex/DeliveryOrderService.updateOrderStatus';

import getClients
from '@salesforce/apex/DeliveryClientService.getClients';

export default class DeliveryDashboard
extends LightningElement {
    menuItemOptions = [];

    selectedMenuItemId;

    menuItemId = '';

    quantity = 1;

    selectedOrderId;

    orderItems = [];


    clientId = '';

    orders;

    wiredOrdersResult;

    clientOptions = [];
    

    handleClientChange(event) {

        this.clientId = event.target.value;
    }
    
    handleMenuItemChange(event) {

        this.menuItemId = event.target.value;
    }

    handleQuantityChange(event) {

        this.quantity = event.target.value;
    }

    handleMenuItemChange(event) {

        this.menuItemId = event.detail.value;
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
    @wire(getClients)
    wiredClients({ data, error }) {

        if(data) {

            this.clientOptions = data.map(

                client => ({

                    label: client.Name,
                    value: client.Id

                })
            );
        }

        else if(error) {

            console.error(error);

        }
    }

    get hasOrderItems() {

        return this.orderItems.length > 0;
        

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
    async selectOrder(event) {

        console.log('CLICK FUNCIONOU');

        this.selectedOrderId =
            event.target.dataset.id;

        try {

            this.orderItems =
                await getOrderItems({

                    orderId:
                        this.selectedOrderId
                });
        }

        catch(error) {

            console.error(error);
            

        }


    }
    async addItemToOrder() {

        try {

            console.log('ANTES ADD ITEM');

            await addOrderItem({

                orderId: this.selectedOrderId,

                menuItemId: this.menuItemId,

                quantity: this.quantity
            });

            console.log('ITEM CRIADO');

            await updateOrderTotal({

                orderId: this.selectedOrderId

            });

            console.log('TOTAL ATUALIZADO');

            this.orderItems =
                await getOrderItems({

                    orderId: this.selectedOrderId

                });

            console.log('ITENS RECARREGADOS');

        }

        catch(error) {

            console.error('ERRO COMPLETO:', error);

            console.error(
                'BODY:',
                JSON.stringify(error)
            );

        }
    }
    @wire(getMenuItems)
    wiredMenuItems({ error, data }) {

        if(data) {

            this.menuItemOptions = data.map(item => {

                return {

                    label:
                        `${item.Name} - R$ ${item.Price__c}`,

                    value:
                        item.Id

                };

            });

        }

        else if(error) {

            console.error(error);

        }
    }
    async changeStatus(event) {
        const orderId =
        event.currentTarget.dataset.id;

        const status =
            event.currentTarget.dataset.status;


        try {

            await updateOrderStatus({

                orderId: orderId,
                status: status

            });

            console.log('STATUS ALTERADO');

            await refreshApex(this.wiredOrdersResult);

        }

        catch(error) {

            console.log(
                'ERRO COMPLETO:',
                JSON.stringify(error)
            );

            console.log(
                'BODY:',
                error.body
            );

            console.log(
                'MESSAGE:',
                error.body?.message
            );

        }
    }

}
