/**
 * 积分/货币展示名的唯一来源。
 * 后端可配置 settings.system.credit_name 覆盖此兜底名。
 */

/** 未配置 credit_name 时的兜底名 */
export const DEFAULT_CREDIT_NAME = '金币';

/**
 * 获取积分/货币展示名。
 * 优先读取后端配置的 credit_name，否则返回兜底名。
 */
export function creditName(settings?: { system?: { credit_name?: string } }): string {
  return settings?.system?.credit_name || DEFAULT_CREDIT_NAME;
}