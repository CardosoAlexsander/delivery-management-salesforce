public with sharing class DeliveryOrderService {


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

    @AuraEnabled
    public static void deleteOrder(Id orderId) {

        delete [

            SELECT Id
            FROM Delivery_Order__c
            WHERE Id = :orderId
            LIMIT 1
        ];
    }
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


}
