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

import getDashboardData
from '@salesforce/apex/DeliveryDashboardService.getDashboardData';

import { ShowToastEvent }
from 'lightning/platformShowToastEvent';

import deleteOrderItem
from '@salesforce/apex/DeliveryOrderItemService.deleteOrderItem';

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
    dashboardData;
    wiredDashboardResult;
    selectedOrderName;
    expandedOrderId;

    
    // Evento para mudança do cliente
    handleClientChange(event) {

        this.clientId = event.target.value;
    }
    
    // Evento para mudança do item do menu
    handleMenuItemChange(event) {

        this.menuItemId = event.target.value;
    }

    //Evento para mudança da quantidade
    handleQuantityChange(event) {

        this.quantity = event.target.value;
    }

    //Evento para mudança do item do menu (usado no combo de adição de item)
    handleMenuItemChange(event) {

        this.menuItemId = event.detail.value;
    }


    
    //Evento para mudança da quantidade (usado no combo de adição de item)
    @wire(getOrders)
    wiredOrders(result) {

        this.wiredOrdersResult = result;

        if(result.data) {

            this.orders =
                result.data.map(order => {

                    return {

                        ...order,

                        isExpanded:
                            order.Id ===
                            this.expandedOrderId

                    };

                });

        }

        else if(result.error) {

            console.error(result.error);

        }
    }

    //Evento para carregar os clientes no combo de seleção
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

    //Evento para carregar os dados do dashboard
    @wire(getDashboardData)
    wiredDashboard(result) {

        this.wiredDashboardResult =
            result;

        if(result.data) {

            this.dashboardData =
                result.data;
        }

        else if(result.error) {

            console.error(
                result.error
            );
        }
    }

    // Getter para verificar se há itens no pedido selecionado
    get hasOrderItems() {

        return this.orderItems.length > 0;
        

    }

    // Getter para verificar se um pedido está selecionado
    get hasSelectedOrder() {

        return this.selectedOrderId != null;

    }

    // Método para criar um novo pedido
    async createNewOrder() {

        try {

            await createOrder({

                clientId: this.clientId
            });

            await refreshApex(
                this.wiredOrdersResult
            );
            await refreshApex(
                this.wiredDashboardResult
            );

        }
        catch(error) {

            console.error(error);
        }
    }

    // Método para deletar o pedido selecionado
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
            await refreshApex(
                this.wiredDashboardResult
            );
        }
        catch(error) {

            console.error(error);
        }
    }

    // Método para selecionar um pedido e carregar seus itens
    async selectOrder(event) {

        const orderId =
            event.target.dataset.id;

        const orderName =
            event.target.dataset.name;

        if(this.expandedOrderId === orderId) {

            this.expandedOrderId = null;

            this.selectedOrderId = null;

            this.orderItems = [];

            this.orders =
                this.orders.map(order => {

                    return {

                        ...order,

                        isExpanded: false

                    };

                });

            return;
        }

        this.selectedOrderId =
            orderId;

        this.selectedOrderName =
            orderName;

        this.expandedOrderId =
            orderId;

        this.orders =
            this.orders.map(order => {

                return {

                    ...order,

                    isExpanded:
                        order.Id === orderId

                };

            });

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

    // Método para adicionar um item ao pedido selecionado
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

            const items =
                await getOrderItems({

                    orderId: this.selectedOrderId

                });

            console.log(
                'ORDER ITEMS:',
                JSON.stringify(items)
            );

            this.orderItems = [...items];

            console.log('ITENS RECARREGADOS');

            await refreshApex(
                this.wiredOrdersResult
            );

            await refreshApex(
                this.wiredDashboardResult
            );
            //mensagem de sucesso e limpeza dos campos
            this.dispatchEvent(

                new ShowToastEvent({

                    title: 'Success',

                    message:
                        'Item added successfully!',

                    variant: 'success'
                })
            );
            this.menuItemId = '';

            this.quantity = 1;

            console.log(
                'DASHBOARD ATUALIZADO'
            );

        }
        catch(error) {

            console.error(
                'ERRO COMPLETO:',
                error
            );
        }
    }

    // Método para carregar os itens do menu e formatar as opções para o combo
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

    // Método para alterar o status do pedido
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
            await refreshApex(
                this.wiredDashboardResult
            );
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

    // Método para deletar um item do pedido
    async deleteItem(event) {

        const itemId =
            event.target.dataset.id;

        try {

            await deleteOrderItem({

                itemId: itemId

            });

            await updateOrderTotal({

                orderId: this.selectedOrderId

            });

            const items =
                await getOrderItems({

                    orderId: this.selectedOrderId

                });

            this.orderItems = [...items];

            await refreshApex(
                this.wiredOrdersResult
            );

            await refreshApex(
                this.wiredDashboardResult
            );

            this.dispatchEvent(

                new ShowToastEvent({

                    title: 'Success',

                    message:
                        'Item deleted successfully!',

                    variant: 'success'

                })

            );

        }

        catch(error) {

            console.error(error);

        }

    }
}
