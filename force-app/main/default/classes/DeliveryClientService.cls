public with sharing class DeliveryClientService {

    @AuraEnabled(cacheable=true)
    public static List<Delivery_Client__c> getClients() {

        return [

            SELECT Id,
                   Name

            FROM Delivery_Client__c

            ORDER BY Name
        ];
    }
}