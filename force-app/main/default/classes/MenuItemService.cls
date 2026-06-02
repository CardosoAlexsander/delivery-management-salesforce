public with sharing class MenuItemService {

    @AuraEnabled(cacheable=true)
    public static List<Menu_Item__c> getMenuItems() {

        return [

            SELECT Id,
                   Name,
                   Price__c

            FROM Menu_Item__c

            ORDER BY Name

        ];
    }
}