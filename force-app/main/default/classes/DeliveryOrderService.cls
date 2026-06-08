public with sharing class DeliveryOrderService {

    // Método para buscar os pedidos de entrega
    @AuraEnabled(cacheable=true)
    public static List<Delivery_Order__c> getOrders() {

        return [

            SELECT
                Id,
                Name,
                Status__c,
                Total_Amount__c,
                Delivery_Client__r.Name

            FROM Delivery_Order__c

            ORDER BY CreatedDate DESC
        ];
    }


    // Método para criar um novo pedido
    @AuraEnabled
    public static Delivery_Order__c createOrder(Id clientId) {

        Delivery_Order__c newOrder =
            new Delivery_Order__c(

                Delivery_Client__c = clientId,
                Status__c = 'Pending'
            );

        insert newOrder;

        return newOrder;
    }

    // Método para deletar um pedido
    @AuraEnabled
    public static void deleteOrder(Id orderId) {

        delete [

            SELECT Id
            FROM Delivery_Order__c
            WHERE Id = :orderId
            LIMIT 1
        ];
    }


    // Método para atualizar o total do pedido com base nos itens
    @AuraEnabled
    public static void updateOrderTotal(Id orderId) {
    AggregateResult result = [

        SELECT SUM(Subtotal__c) total

        FROM Delivery_Order_Item__c

        WHERE Delivery_Order__c = :orderId
    ];

    Decimal total =
        (Decimal) result.get('total');

    if(total == null) {
        total = 0;
    }

    Delivery_Order__c orderRecord = [

        SELECT Id, Total_Amount__c

        FROM Delivery_Order__c

        WHERE Id = :orderId

        LIMIT 1
    ];
    orderRecord.Total_Amount__c = total;
    update orderRecord;
    }


    // Método para alterar o status do pedido
    @AuraEnabled
    public static void updateOrderStatus(

        Id orderId,
        String status

    ) {

        Delivery_Order__c orderRecord = [

            SELECT Id,
                Status__c

            FROM Delivery_Order__c

            WHERE Id = :orderId

            LIMIT 1
        ];

        String currentStatus =
            orderRecord.Status__c;

        Boolean validTransition = false;

        if(
            currentStatus == 'Pending'
            &&
            status == 'Preparing'
        ) {

            validTransition = true;
        }

        else if(
            currentStatus == 'Preparing'
            &&
            status == 'Out For Delivery'
        ) {

            validTransition = true;
        }

        else if(
            currentStatus == 'Out For Delivery'
            &&
            status == 'Delivered'
        ) {

            validTransition = true;
        }

        if(!validTransition) {

            throw new AuraHandledException(

                'Invalid status transition.'

            );
        }
        orderRecord.Status__c = status;

        update orderRecord;
    }
}
