import { DashboardHeader } from "@/components/dashboard-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  return (
    <div>
      <DashboardHeader
        title="Ajustes"
        description="Gestiona tu cuenta y la configuración de la aplicación."
      />
      <Tabs defaultValue="userManagement">
        <TabsList>
          <TabsTrigger value="userManagement">Usuarios</TabsTrigger>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
          <TabsTrigger value="publicPortal">Portal Público</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
        </TabsList>
        <TabsContent value="userManagement" className="p-4 border rounded-md mt-2">
          <p>Gestión de usuarios aquí.</p>
        </TabsContent>
        <TabsContent value="roles" className="p-4 border rounded-md mt-2">
          <p>Gestión de roles y permisos aquí.</p>
        </TabsContent>
         <TabsContent value="publicPortal" className="p-4 border rounded-md mt-2">
          <p>Configuración del portal público aquí.</p>
        </TabsContent>
         <TabsContent value="notifications" className="p-4 border rounded-md mt-2">
          <p>Configuración de notificaciones aquí.</p>
        </TabsContent>
         <TabsContent value="integrations" className="p-4 border rounded-md mt-2">
          <p>Configuración de integraciones aquí.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
