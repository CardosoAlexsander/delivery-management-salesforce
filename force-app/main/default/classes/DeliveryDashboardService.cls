public with sharing class DeliveryDashboardService {

    // Classe para encapsular os dados do dashboard
    public class DashboardData {

        @AuraEnabled
        public Integer totalOrders;

        @AuraEnabled
        public Decimal totalRevenue;

        @AuraEnabled
        public Integer pendingOrders;

        @AuraEnabled
        public Integer deliveredOrders;

        @AuraEnabled
        public Decimal averageOrderValue;
    }


    // Método para buscar os dados do dashboard
    @AuraEnabled(cacheable=true)
    public static DashboardData getDashboardData() {

        DashboardData data =
            new DashboardData();

        data.totalOrders = [

            SELECT COUNT()

            FROM Delivery_Order__c
        ];

        AggregateResult revenue = [

            SELECT SUM(Total_Amount__c) total

            FROM Delivery_Order__c
        ];

        data.totalRevenue =
            (Decimal) revenue.get('total');

        if(data.totalRevenue == null) {

            data.totalRevenue = 0;
        }

        data.pendingOrders = [

            SELECT COUNT()

            FROM Delivery_Order__c

            WHERE Status__c = 'Pending'
        ];

        data.deliveredOrders = [

            SELECT COUNT()

            FROM Delivery_Order__c

            WHERE Status__c = 'Delivered'
        ];
        if(data.totalOrders > 0) {

            data.averageOrderValue =
                data.totalRevenue /
                data.totalOrders;

        }

        else {

            data.averageOrderValue = 0;

        }

        return data;
    }
}