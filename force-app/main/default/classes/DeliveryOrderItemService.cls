public with sharing class DeliveryOrderItemService {


    @AuraEnabled(cacheable=true)
    public static List<Delivery_Order_Item__c> getOrderItems(Id orderId) {

        return [

            SELECT
                Id,
                Name,
                Quantity__c,
                Unit_Price__c,
                Subtotal__c,
                Menu_Item__r.Name

            FROM Delivery_Order_Item__c

            WHERE Delivery_Order__c = :orderId

            ORDER BY CreatedDate DESC
        ];
    }

    @AuraEnabled
    public static void addOrderItem(

        Id orderId,
        Id menuItemId,
        Decimal quantity

    ) {

        Menu_Item__c menuItem = [

            SELECT Id,
                Price__c

            FROM Menu_Item__c

            WHERE Id = :menuItemId

            LIMIT 1
        ];

        Delivery_Order_Item__c item =
            new Delivery_Order_Item__c(

                Delivery_Order__c = orderId,
                Menu_Item__c = menuItemId,
                Quantity__c = quantity,
                Unit_Price__c = menuItem.Price__c
            );

        insert item;
    }

    @AuraEnabled
    public static void deleteOrderItem(Id itemId) {

        delete [

            SELECT Id
            FROM Delivery_Order_Item__c
            WHERE Id = :itemId
            LIMIT 1
        ];
    }


}
