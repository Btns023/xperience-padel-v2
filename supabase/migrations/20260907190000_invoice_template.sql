-- ===========================================================================
-- Facture — alignement sur le template Xperience :
--  * app_settings : téléphone, e-mail, banque, texte légal de bas de page,
--    logo (data URI), format de numéro
--  * invoices.due_on : date d'échéance
--  * numéro au format "AAAA-NNN" (préfixe vide) ; notes de crédit "NC AAAA-NNN"
-- ===========================================================================

alter table public.app_settings
  add column issuer_phone   text not null default '',
  add column issuer_email   text not null default '',
  add column issuer_bank    text not null default '',
  add column logo_data_uri  text,
  add column footer_legal   text not null default '',
  add column cgv_note       text not null default '';

alter table public.invoices
  add column due_on date;

update public.app_settings set
  issuer_phone = '0473/607207',
  issuer_email = 'info@padelxp.be',
  issuer_bank  = 'BNP',
  invoice_prefix = '',
  credit_note_prefix = 'NC',
  footer_legal =
    'Tout retard de paiement donnera lieu, de plein droit et sans mise en '
    || 'demeure préalable, au dû d''une indemnité forfaitaire de 10 % du '
    || 'montant impayé avec un minimum de 40 euros.',
  cgv_note = 'Conditions générales de vente au verso.'
where id = 'default';
