// app/(dashboard)/clientes/components/ClienteCreateModal.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem,
    FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useClientesStore } from '@/stores/clientesStore';
import { useCreateCliente } from '@/lib/hooks/useClientes';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    apellidos: z.string().min(2, 'Mínimo 2 caracteres'),
    email: z.string().email('Email inválido'),
    telefono: z.string().min(8, 'Teléfono inválido'),
    documento: z.string().min(5, 'Documento inválido'),
    tipoDocumento: z.enum(['cedula', 'pasaporte', 'ruc']),
    fechaNacimiento: z.string().min(1, 'Requerido'),
    genero: z.enum(['M', 'F', 'otro']).optional(),
    canalRegistro: z.enum(['portal_web', 'app', 'pos', 'import_masivo']),
    recibirNotificaciones: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

export function ClienteCreateModal() {
    const { showCreateModal, closeCreateModal } = useClientesStore();
    const createMutation = useCreateCliente();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nombre: '',
            apellidos: '',
            email: '',
            telefono: '',
            documento: '',
            tipoDocumento: 'cedula',
            fechaNacimiento: '',
            canalRegistro: 'portal_web',
            recibirNotificaciones: true,
        },
    });

    const onSubmit = (values: FormValues) => {
        createMutation.mutate({
            ...values,
            preferencias: {
                categoriasFavoritas: [],
                intereses: [],
                recibirNotificaciones: values.recibirNotificaciones,
                canalNotificacion: ['email'],
            },
        });
    };

    return (
        <Dialog open={showCreateModal} onOpenChange={closeCreateModal}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Nuevo Cliente</DialogTitle>
                    <DialogDescription>
                        Registra un nuevo miembro al club de mercancías
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="nombre"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="juan@ejemplo.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="telefono"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input placeholder="8888-8888" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fechaNacimiento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Nacimiento</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="tipoDocumento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tipo Documento</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="cedula">Cédula</SelectItem>
                                                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
                                                    <SelectItem value="ruc">RUC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="documento"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número Documento</FormLabel>
                                            <FormControl>
                                                <Input placeholder="1-1234-5678" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="genero"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Género (opcional)</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccionar" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="M">Masculino</SelectItem>
                                                    <SelectItem value="F">Femenino</SelectItem>
                                                    <SelectItem value="otro">Otro</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="canalRegistro"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Canal de Registro</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="portal_web">Portal Web</SelectItem>
                                                    <SelectItem value="app">App Móvil</SelectItem>
                                                    <SelectItem value="pos">Punto de Venta</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="recibirNotificaciones"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                            Recibir notificaciones por email
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeCreateModal}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending}>
                                    {createMutation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    Crear Cliente
                                </Button>
                            </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} placeholder = "Juan" {...field } />
                    </FormControl >
    <FormMessage />
                  </FormItem >
                )}
              />
    < FormField
control = { form.control }
name = "apellidos"
render = {({ field }) => (
    <FormItem>
        <FormLabel>Apellidos</FormLabel>
        <FormControl>
            <Input placeholder="Pérez García" {...field} />
        </FormControl>
        <FormMessage />
    </FormItem>
)}
              />
            </div >

    <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
            <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input