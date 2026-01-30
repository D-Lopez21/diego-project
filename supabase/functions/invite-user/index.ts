/// <reference types="deno" />
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-invite-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verificar secret de invitación
    const secretHeader = req.headers.get("x-invite-secret");
    if (secretHeader !== Deno.env.get("INVITE_SECRET")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parsear datos del body
    const { email, fullName, role, rif } = await req.json();
    
    // Validaciones básicas
    if (!email || !fullName || !role) {
      return new Response(JSON.stringify({ error: "Datos incompletos: email, fullName y role son requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validar formato de RIF si se proporciona
    if (rif) {
      const rifRegex = /^[JVEG]-\d{8,9}-?\d?$/i;
      if (!rifRegex.test(rif)) {
        return new Response(
          JSON.stringify({ error: "Formato de RIF inválido. Use el formato: J-12345678-9" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Verificar si el email ya existe en Auth
    const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingAuthUser.users.some(u => u.email === email);

    if (userExists) {
      return new Response(
        JSON.stringify({ error: "Este correo electrónico ya está registrado" }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // URL de redirección
    const redirectUrl = Deno.env.get("SITE_URL") 
      ? `${Deno.env.get("SITE_URL")}/reset-password`
      : "http://localhost:5173/reset-password";

    // Construir metadata para el trigger (usar raw_user_meta_data)
    const userMetadata: Record<string, any> = {
      name: fullName, 
      role: role,
    };

    // Agregar RIF a metadata solo si existe
    if (rif) {
      userMetadata.rif = rif;
    }

    // Invitar usuario en Auth (el trigger handle_new_user_invite creará el perfil automáticamente)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: userMetadata,
        redirectTo: redirectUrl,
      }
    );

    if (authError) throw authError;

    if (!authData.user) {
      throw new Error("Error al crear el usuario en Auth");
    }

    console.log("✅ Usuario creado en Auth:", authData.user.id);
    console.log("✅ El trigger debería crear el perfil automáticamente");

    // Esperar un momento para que el trigger se ejecute
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Verificar que el perfil se creó
    const { data: profile, error: profileCheckError } = await supabaseAdmin
      .from("profile")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileCheckError || !profile) {
      console.error("❌ El trigger no creó el perfil:", profileCheckError);
      throw new Error("Error: el perfil no se creó automáticamente");
    }

    console.log("✅ Perfil verificado:", profile);

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: authData.user.id,
          email: email,
          name: fullName, 
          role: role,
          ...(rif && { rif }),
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (err: any) {
    console.error("❌ Error en invite-user:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Error interno del servidor" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});